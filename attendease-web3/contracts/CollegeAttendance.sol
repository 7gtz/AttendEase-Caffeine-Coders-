// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract CollegeAttendance {

    constructor() {
        admin = 0x850692CE85850278B754695fa4eb69d6840745d5; 
        admin = msg.sender;
    }

    struct Subject {
        uint256 id;
        string name;
        address teacher; // Teacher specific to this section's subject
        uint256[] classIds;
    }

    struct Section {
        uint256 id;
        string name;
        mapping(uint256 => Subject) subjects; // Section-specific subjects
        uint256[] subjectIds;
        address[] students;
        mapping(address => bool) isEnrolled;
    }

    struct Class {
        uint256 id;
        uint256 sectionId;
        uint256 subjectId; // Refers to the section's subject
        bytes32 geohash;
        uint256 startTime;
        uint256 endTime;
        bool attendanceClosed;
    }
    struct AdjustmentRequest {
        address teacher;
        uint256 classId;
        address student;
        bool approved;
    }

    address public admin;
    uint256 public sectionCounter;
    uint256 public classCounter;
    uint256 public requestCounter;
    uint256 public constant GEOHASH_TOLERANCE_BYTES = 8;
    mapping(address => string) public userNames;
    mapping(uint256 => Section) public sections;
    mapping(bytes32 => AdjustmentRequest) public adjustmentRequests;
    mapping(uint256 => Class) public classes; // classId → Class
    mapping(address => mapping(uint256 => bool)) public attendance; // student → classId → attended
    mapping(uint256 => address[]) public sectionStudents; // sectionId → students
    mapping(uint256 => mapping(address => bool)) public isEnrolled;
    mapping(bytes32 => bool) public usedLocationProofs;

    event AdjustmentApproved(bytes32 indexed requestId, address indexed student, uint256 classId);
    
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin");
        _;
    }

    modifier onlySectionStudent(uint256 sectionId) {
        require(isEnrolled[sectionId][msg.sender], "Not enrolled");
        _;
    }

    modifier validSection(uint256 sectionId) {
        require(sections[sectionId].id == sectionId, "Invalid section");
        _;
    }
    modifier onlySubjectTeacher(uint256 sectionId, uint256 subjectId) {
        require(
            subjectId < sections[sectionId].subjectIds.length, 
            "Invalid subject ID"
        );
        require(
            msg.sender == sections[sectionId].subjects[subjectId].teacher,
            "Not section's subject teacher"
        );
    _;
}

    function compareGeohashPrefix(bytes32 geohash1, bytes32 geohash2, uint256 prefixBytes) 
        internal 
        pure 
        returns (bool) 
    {
        require(prefixBytes > 0, "Zero prefix not allowed");
        require(prefixBytes <= 32, "Prefix too large");
        require(prefixBytes >= 8, "Precision too low for attendance");
        bytes32 mask = bytes32((1 << (256 - (prefixBytes * 8))) - 1) ^ bytes32(type(uint256).max);
        return (geohash1 & mask) == (geohash2 & mask);
    }

    function transferAdmin(address newAdmin) external onlyAdmin {
        require(newAdmin != address(0), "Invalid address");
        admin = newAdmin;
    }

    event SectionCreated(uint256 indexed sectionId, string name);
    function createSection(string memory name) external onlyAdmin {
        uint256 sectionId = sectionCounter++;
        Section storage newSection = sections[sectionId];
        newSection.id = sectionId;
        newSection.name = name;
        emit SectionCreated(sectionId, name);
    }

    event ClassStarted(uint256 indexed sectionId, uint256 subjectId, uint256 classId);

    function startClass(
        uint256 sectionId,
        uint256 subjectId,
        bytes32 geohash,
        uint256 durationMinutes
    ) external validSection(sectionId) onlySubjectTeacher(sectionId, subjectId) {
        uint256 classId = classCounter++;
        
        classes[classId] = Class({
            id: classId,
            sectionId: sectionId,
            subjectId: subjectId,
            geohash: geohash,
            startTime: block.timestamp,
            endTime: block.timestamp + durationMinutes * 1 minutes,
            attendanceClosed: false
        });
        
        sections[sectionId].subjects[subjectId].classIds.push(classId);
        emit ClassStarted(sectionId, subjectId, classId);
    }

    function addSubjectToSection(
        uint256 sectionId,
        string memory subjectName,
        address teacher
    ) external onlyAdmin {
        Section storage section = sections[sectionId];
        for (uint256 i = 0; i < section.subjectIds.length; i++) {
            Subject storage s = section.subjects[i];
            if (keccak256(bytes(s.name)) == keccak256(bytes(subjectName))) {
                revert("Subject exists");
            }
        }
        uint256 subjectId = sections[sectionId].subjectIds.length;
        sections[sectionId].subjects[subjectId] = Subject({
            id: subjectId,
            name: subjectName,
            teacher: teacher,
            classIds: new uint256[](0)
        });
        sections[sectionId].subjectIds.push(subjectId);
    }

    function setUserName(string memory name) external {
        require(bytes(name).length > 0 && bytes(name).length <= 32, "Invalid name length");
        userNames[msg.sender] = name;
    }

    function getUserName(address user) external view returns (string memory) {
        return userNames[user];
    }

    event AttendanceMarked(address student, uint256 classId);
    function markAttendance(
        uint256 classId,
        bytes32 studentGeohash,
        uint256 studentTimestamp,
        bytes memory teacherSig,
        bytes memory studentSig
    ) external {
        Class storage class = classes[classId];
        Section storage section = sections[class.sectionId];
        
        require(section.isEnrolled[msg.sender], "Not enrolled");
        require(!class.attendanceClosed, "Attendance closed");
        require(block.timestamp <= class.endTime, "Class ended");
        require(!attendance[msg.sender][classId], "Already marked");
        // Replace exact match with prefix comparison
        require(
            compareGeohashPrefix(studentGeohash, class.geohash, GEOHASH_TOLERANCE_BYTES),
            "Location mismatch"
        );

        // Verify signatures
        bytes32 teacherMessage = keccak256(abi.encodePacked(class.geohash, class.startTime));
        require(_verifySig(teacherMessage, teacherSig, section.subjects[class.subjectId].teacher), "Invalid teacher proof");

        bytes32 studentMessage = keccak256(abi.encodePacked(studentGeohash, studentTimestamp));
        require(_verifySig(studentMessage, studentSig, msg.sender), "Invalid student proof");

        // Prevent proof reuse
        bytes32 proofHash = keccak256(abi.encodePacked(teacherSig, studentSig));
        require(!usedLocationProofs[proofHash], "Proofs reused");
        usedLocationProofs[proofHash] = true;

        attendance[msg.sender][classId] = true;
        emit AttendanceMarked(msg.sender, classId);
    }

    event AdjustmentRequested(bytes32 requestId, uint256 classId, address student);
    function requestAdjustment(uint256 classId, address student) external {
        Class storage class = classes[classId];
        require(
            msg.sender == sections[class.sectionId].subjects[class.subjectId].teacher,
            "Unauthorized"
        );
        
        bytes32 requestId = keccak256(abi.encodePacked(classId, student, requestCounter));
        adjustmentRequests[requestId] = AdjustmentRequest({
            teacher: msg.sender,
            classId: classId,
            student: student,
            approved: false
        });
        requestCounter++;
    }

    function closeAttendance(uint256 classId) external {
        Class storage class = classes[classId];
        require(
            msg.sender == sections[class.sectionId].subjects[class.subjectId].teacher,
            "Unauthorized"
        );
        class.attendanceClosed = true;
    }
    
    function isTeacher(address _address) public view returns (bool) {
    for (uint256 i = 0; i < sectionCounter; i++) {
        Section storage section = sections[i];
        for (uint256 j = 0; j < section.subjectIds.length; j++) {
            uint256 subjectId = section.subjectIds[j];
            if (section.subjects[subjectId].teacher == _address) {
                return true;
            }
        }
    }
    return false;
}

    function approveAdjustment(bytes32 requestId) external {
        AdjustmentRequest storage request = adjustmentRequests[requestId];
        require(request.teacher != address(0), "Invalid request");
        require(!request.approved, "Already approved");
        require(msg.sender == request.student || msg.sender == admin, "Unauthorized");

        request.approved = true;
        attendance[request.student][request.classId] = true;
        emit AdjustmentApproved(requestId, request.student, request.classId);
    }

    function splitSignature(bytes memory sig) 
        internal 
        pure 
        returns (bytes32 r, bytes32 s, uint8 v) 
    {
        require(sig.length == 65, "Invalid signature length");
        assembly {
            r := mload(add(sig, 32))
            s := mload(add(sig, 64))
            v := byte(0, mload(add(sig, 96)))
        }
    }

    function _verifySig(bytes32 message, bytes memory sig, address expected) internal pure returns (bool) {
        bytes32 ethSignedMessage = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", message));
        (bytes32 r, bytes32 s, uint8 v) = splitSignature(sig);
        return ecrecover(ethSignedMessage, v, r, s) == expected;
    }

    function _validateAttendance(
        uint256 classId,
        bytes32 studentGeohash,
        bytes memory teacherSig,
        bytes memory studentSig
    ) internal view {
        Class storage class = classes[classId];
        Section storage section = sections[class.sectionId];
        
        require(isEnrolled[class.sectionId][msg.sender], "Not enrolled");
        require(class.endTime > block.timestamp, "Class ended");
        // Replace exact match with prefix comparison
        require(
            compareGeohashPrefix(studentGeohash, class.geohash, GEOHASH_TOLERANCE_BYTES),
            "Location mismatch"
        );

        // Verify teacher signature
        bytes32 teacherMessage = keccak256(abi.encodePacked(class.geohash, class.startTime));
        address subjectTeacher = section.subjects[class.subjectId].teacher;
        require(_verifySig(teacherMessage, teacherSig, subjectTeacher), "Invalid teacher proof");

        // Verify student signature
        bytes32 studentMessage = keccak256(abi.encodePacked(studentGeohash, block.timestamp));
        require(_verifySig(studentMessage, studentSig, msg.sender), "Invalid student proof");

        // Prevent reuse of proofs
        bytes32 proofHash = keccak256(abi.encodePacked(teacherSig, studentSig));
        require(!usedLocationProofs[proofHash], "Proofs reused");
    }

    function _updateClassCount(uint256 sectionId, uint256 subjectId) internal {
    Section storage section = sections[sectionId];
    Subject storage subject = section.subjects[subjectId];
    for (uint256 i = 0; i < sectionStudents[sectionId].length; i++) {
        address student = sectionStudents[sectionId][i];
        if (isEnrolled[sectionId][student]) {
            subject.classIds.push(classCounter); 
            }
        }
    }

    function getSubjectClasses(string memory subjectName) 
    external view returns (uint256[] memory) 
    {
        uint256 totalClasses;
        for (uint256 i = 0; i < sectionCounter; i++) {
            Section storage section = sections[i];
            for (uint256 j = 0; j < section.subjectIds.length; j++) {
                uint256 subjectId = section.subjectIds[j];
                Subject storage subject = section.subjects[subjectId];
                if (keccak256(bytes(subject.name)) == keccak256(bytes(subjectName))) {
                    totalClasses += subject.classIds.length;
                }
            }
        }

        // Second pass: populate results
        uint256[] memory result = new uint256[](totalClasses);
        uint256 counter;
        for (uint256 i = 0; i < sectionCounter; i++) {
            Section storage section = sections[i];
            for (uint256 j = 0; j < section.subjectIds.length; j++) {
                uint256 subjectId = section.subjectIds[j];
                Subject storage subject = section.subjects[subjectId];
                if (keccak256(bytes(subject.name)) == keccak256(bytes(subjectName))) {
                    for (uint256 k = 0; k < subject.classIds.length; k++) {
                        result[counter] = subject.classIds[k];
                        counter++;
                    }
                }
            }
        }
        return result;
    }

    function addStudent(uint256 sectionId, address student) external validSection(sectionId) onlyAdmin {
        require(!sections[sectionId].isEnrolled[student], "Already enrolled");
        sections[sectionId].isEnrolled[student] = true;
    }

    function removeStudent(uint256 sectionId, address student) external validSection(sectionId) onlyAdmin {
        require(sections[sectionId].isEnrolled[student], "Not enrolled");
        sections[sectionId].isEnrolled[student] = false;
    }

    function getYearMonth(uint256 timestamp) public pure returns (uint256 year, uint256 month) {
        (year, month, ) = _daysToDate(timestamp / 1 days);
    }

    function _daysToDate(uint256 _days) internal pure returns (uint256 y, uint256 m, uint256 d) {
        int256 __days = int256(_days);
        int256 L = __days + 68569 + 2440588; // Offset for 1970-01-01
        int256 N = 4 * L / 146097;
        L = L - (146097 * N + 3) / 4;
        int256 _year = 4000 * (L + 1) / 1461001;
        L = L - 1461 * _year / 4 + 31;
        int256 _month = 80 * L / 2447;
        d = uint256(L - 2447 * _month / 80);
        L = _month / 11;
        m = uint256(_month + 2 - 12 * L);
        y = uint256(100 * (N - 49) + _year + L);
    }

    function getCombinedAttendance(address student, uint256 sectionId)
        external view returns (uint256 attended, uint256 total)
    {
        Section storage section = sections[sectionId];
        total = 0;
        attended = 0;
        for (uint256 i = 0; i < section.subjectIds.length; i++) {
            uint256 subjectId = section.subjectIds[i];
            uint256[] storage classIds = section.subjects[subjectId].classIds;
            total += classIds.length;
            for (uint256 j = 0; j < classIds.length; j++) {
                if (attendance[student][classIds[j]]) attended++;
            }
        }
    }
}
