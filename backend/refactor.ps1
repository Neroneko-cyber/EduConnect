$src = "c:\Antigravity\A6\backend\src\main\java\com\educonnect"
$test = "c:\Antigravity\A6\backend\src\test\java\com\educonnect"

# 1. Update package declarations inside the newly moved DTO files
Get-ChildItem -Path $src -Recurse -Include *.java | Where-Object { $_.FullName -like "*\dto\*" } | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    
    # Fix package declarations
    if ($_.FullName -match "announcement\\dto") { $content = $content -replace "package com\.educonnect\.dto;", "package com.educonnect.announcement.dto;" }
    if ($_.FullName -match "grade\\dto") { $content = $content -replace "package com\.educonnect\.dto;", "package com.educonnect.grade.dto;" }
    if ($_.FullName -match "disposition\\dto") { $content = $content -replace "package com\.educonnect\.dto;", "package com.educonnect.disposition.dto;" }
    if ($_.FullName -match "asset\\dto") { $content = $content -replace "package com\.educonnect\.dto;", "package com.educonnect.asset.dto;" }

    # Fix class names
    $content = $content -replace "public class GradeDto", "public class GradeRequest"
    if ($_.FullName -match "GradeResponse.java") {
        $content = $content -replace "public class GradeRequest", "public class GradeResponse"
    }
    $content = $content -replace "public class ForwardTicketDto", "public class ForwardTicketRequest"
    $content = $content -replace "public class KepsekRespondDto", "public class KepsekRespondRequest"
    $content = $content -replace "public class TuRespondDto", "public class TuRespondRequest"

    [IO.File]::WriteAllText($_.FullName, $content)
}

# 2. Update imports and types in all .java files (including tests)
Get-ChildItem -Path "c:\Antigravity\A6\backend\src" -Recurse -Include *.java | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    $original = $content

    # Replace imports
    $content = $content -replace "import com\.educonnect\.dto\.AnnouncementRequest;", "import com.educonnect.announcement.dto.AnnouncementRequest;"
    $content = $content -replace "import com\.educonnect\.dto\.BulkGradeUpdateRequest;", "import com.educonnect.grade.dto.BulkGradeUpdateRequest;"
    $content = $content -replace "import com\.educonnect\.dto\.DispositionRequest;", "import com.educonnect.disposition.dto.DispositionRequest;"
    $content = $content -replace "import com\.educonnect\.dto\.DispositionStatusUpdateRequest;", "import com.educonnect.disposition.dto.DispositionStatusUpdateRequest;"
    $content = $content -replace "import com\.educonnect\.dto\.ForwardTicketDto;", "import com.educonnect.asset.dto.ForwardTicketRequest;"
    $content = $content -replace "import com\.educonnect\.dto\.KepsekRespondDto;", "import com.educonnect.asset.dto.KepsekRespondRequest;"
    $content = $content -replace "import com\.educonnect\.dto\.TuRespondDto;", "import com.educonnect.asset.dto.TuRespondRequest;"
    
    # GradeDto import is tricky because it splits into GradeRequest and GradeResponse
    $content = $content -replace "import com\.educonnect\.dto\.GradeDto;", "import com.educonnect.grade.dto.GradeRequest;`nimport com.educonnect.grade.dto.GradeResponse;"

    # Replace usages in code
    $content = $content -replace "ForwardTicketDto", "ForwardTicketRequest"
    $content = $content -replace "KepsekRespondDto", "KepsekRespondRequest"
    $content = $content -replace "TuRespondDto", "TuRespondRequest"

    # For GradeDto, mostly it was a Response in getGradesByClassroom
    # GradeController.java
    if ($_.FullName -match "GradeController.java") {
        $content = $content -replace "List<GradeDto> getGrades", "List<GradeResponse> getGrades"
        $content = $content -replace "List<GradeDto> grades =", "List<GradeResponse> grades ="
    }
    # GradeService.java
    if ($_.FullName -match "GradeService.java") {
        $content = $content -replace "List<GradeDto> getGradesByClassroom", "List<GradeResponse> getGradesByClassroom"
        $content = $content -replace "GradeDto convertToDto", "GradeResponse convertToDto"
        $content = $content -replace "GradeDto dto = new GradeDto", "GradeResponse dto = new GradeResponse"
        $content = $content -replace "for \(GradeDto dto : request\.getGrades\(\)\)", "for (GradeRequest dto : request.getGrades())"
        $content = $content -replace "GradeDto dto", "GradeResponse dto" # catch all others in GradeService if any
    }
    # GradeControllerTest.java
    if ($_.FullName -match "GradeControllerTest.java") {
        $content = $content -replace "GradeDto grade = new GradeDto", "GradeResponse grade = new GradeResponse"
        $content = $content -replace "List<GradeDto>", "List<GradeResponse>"
    }
    # GradeServiceTest.java
    if ($_.FullName -match "GradeServiceTest.java") {
        $content = $content -replace "GradeDto gradeDto", "GradeRequest gradeDto"
        $content = $content -replace "GradeDto newGradeDto = new GradeDto", "GradeRequest newGradeDto = new GradeRequest"
        $content = $content -replace "List<GradeDto>", "List<GradeResponse>"
    }
    # BulkGradeUpdateRequest.java
    if ($_.FullName -match "BulkGradeUpdateRequest.java") {
        $content = $content -replace "List<GradeDto> grades;", "List<GradeRequest> grades;"
    }

    if ($content -ne $original) {
        [IO.File]::WriteAllText($_.FullName, $content)
    }
}
echo "Refactoring Script Complete"
