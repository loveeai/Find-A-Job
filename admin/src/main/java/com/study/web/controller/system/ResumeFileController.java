package com.study.web.controller.system;

import com.study.common.response.ResponseResult;
import com.study.web.controller.BaseController;
import com.study.web.controller.domin.ResumeFile;
import com.study.web.controller.service.IResumeFileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import javax.servlet.http.HttpServletResponse;
import java.io.File;
import java.io.IOException;
import java.net.URLEncoder;
import java.net.URLConnection;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.UUID;

@RestController
public class ResumeFileController extends BaseController {

    @Autowired
    private IResumeFileService resumeFileService;

    @Value("${file.upload.path:uploads/resume}")
    private String uploadPath;

    @GetMapping("/resumeFile")
    public ResponseResult selectResumeFileList(ResumeFile resumeFile) {
        startPage();
        List<ResumeFile> data = resumeFileService.selectResumeFileList(resumeFile);
        return getResult(data);
    }

    @GetMapping("/resumeFile/{id}")
    public ResponseResult selectResumeFileById(@PathVariable Long id) {
        ResumeFile resumeFile = resumeFileService.selectResumeFileById(id);
        return getResult(resumeFile);
    }

    @PostMapping("/resumeFile")
    public ResponseResult insertResumeFile(@RequestBody ResumeFile resumeFile) {
        return getResult(resumeFileService.insertResumeFile(resumeFile));
    }

    @PostMapping("/resumeFile/upload")
    public ResponseResult uploadResumeFile(@RequestParam("file") MultipartFile file,
                                           @RequestParam("resumeId") Long resumeId,
                                           @RequestParam(value = "displayName", required = false) String displayName) {
        if (resumeId == null) {
            return ResponseResult.error("Resume id is required");
        }

        if (file == null || file.isEmpty()) {
            return ResponseResult.error("Upload file is empty");
        }

        File savedFile = null;
        try {
            String projectPath = System.getProperty("user.dir");
            File uploadDir = new File(projectPath, uploadPath);
            if (!uploadDir.exists() && !uploadDir.mkdirs()) {
                return ResponseResult.error("Cannot create upload directory");
            }

            String originalFilename = sanitizeFileName(file.getOriginalFilename());
            if (originalFilename.isEmpty()) {
                originalFilename = "resume-file";
            }

            String storedFilename = UUID.randomUUID() + "_" + originalFilename;
            savedFile = new File(uploadDir, storedFilename);
            file.transferTo(savedFile);

            ResumeFile resumeFile = new ResumeFile();
            resumeFile.setResumeId(resumeId);
            resumeFile.setFileName(buildDisplayName(displayName, originalFilename));
            resumeFile.setFilePath(savedFile.getAbsolutePath());
            resumeFile.setFileSize(file.getSize());
            resumeFile.setFileType(resolveStoredFileType(file, originalFilename));
            resumeFile.setCreateTime(new Date());

            return getResult(resumeFileService.insertResumeFile(resumeFile));
        } catch (IOException e) {
            deletePhysicalFile(savedFile);
            return ResponseResult.error("Upload failed");
        } catch (Exception e) {
            deletePhysicalFile(savedFile);
            return ResponseResult.error("Upload failed");
        }
    }

    @PutMapping("/resumeFile")
    public ResponseResult updateResumeFile(@RequestBody ResumeFile resumeFile) {
        return getResult(resumeFileService.updateResumeFile(resumeFile));
    }

    @DeleteMapping("/resumeFile/{id}")
    public ResponseResult deleteResumeFileById(@PathVariable Long id) {
        ResumeFile resumeFile = resumeFileService.selectResumeFileById(id);
        if (resumeFile == null) {
            return ResponseResult.error("Attachment not found");
        }

        int rows = resumeFileService.deleteResumeFileById(id);
        if (rows > 0) {
            deletePhysicalFile(resumeFile.getFilePath());
        }
        return getResult(rows);
    }

    @DeleteMapping("/resumeFile/ids/{ids}")
    public ResponseResult deleteResumeFileByIds(@PathVariable String[] ids) {
        List<ResumeFile> files = new ArrayList<>();
        if (ids != null) {
            for (String id : ids) {
                try {
                    ResumeFile resumeFile = resumeFileService.selectResumeFileById(Long.valueOf(id));
                    if (resumeFile != null) {
                        files.add(resumeFile);
                    }
                } catch (NumberFormatException ignored) {
                }
            }
        }

        int rows = resumeFileService.deleteResumeFileByIds(ids);
        if (rows > 0) {
            for (ResumeFile file : files) {
                deletePhysicalFile(file.getFilePath());
            }
        }
        return getResult(rows);
    }

    @GetMapping("/resumeFile/download/{id}")
    public void downloadResumeFile(@PathVariable Long id, HttpServletResponse response) {
        try {
            ResumeFile resumeFile = resumeFileService.selectResumeFileById(id);
            if (resumeFile == null) {
                response.setStatus(HttpServletResponse.SC_NOT_FOUND);
                response.getWriter().write("File not found");
                return;
            }

            File file = new File(resumeFile.getFilePath());
            if (!file.exists()) {
                response.setStatus(HttpServletResponse.SC_NOT_FOUND);
                response.getWriter().write("File not found");
                return;
            }

            String contentType = resolveDownloadContentType(resumeFile, file);
            response.setContentType(contentType == null || contentType.trim().isEmpty()
                    ? "application/octet-stream"
                    : contentType);
            response.setContentLengthLong(file.length());
            String encodedFileName = URLEncoder.encode(resumeFile.getFileName(), StandardCharsets.UTF_8.name())
                    .replace("+", "%20");
            response.setHeader("Content-Disposition", "attachment; filename*=UTF-8''" + encodedFileName);

            Files.copy(file.toPath(), response.getOutputStream());
            response.flushBuffer();
        } catch (IOException e) {
            try {
                response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                response.getWriter().write("File download failed");
            } catch (IOException ignored) {
            }
        }
    }

    private String buildDisplayName(String displayName, String originalFilename) {
        String original = sanitizeFileName(originalFilename);
        String extension = "";
        int dotIndex = original.lastIndexOf('.');
        if (dotIndex >= 0) {
            extension = original.substring(dotIndex);
        }

        String visibleName = sanitizeFileName(displayName);
        if (visibleName.isEmpty()) {
            return original.isEmpty() ? "resume-file" : original;
        }

        if (!extension.isEmpty() && !visibleName.toLowerCase().endsWith(extension.toLowerCase())) {
            return visibleName + extension;
        }
        return visibleName;
    }

    private String resolveStoredFileType(MultipartFile file, String originalFilename) {
        String contentType = sanitizeFileName(file.getContentType());
        if (!contentType.isEmpty() && contentType.length() <= 20) {
            return contentType;
        }

        String extension = getFileExtension(originalFilename);
        if (!extension.isEmpty()) {
            return extension;
        }

        return "file";
    }

    private String resolveDownloadContentType(ResumeFile resumeFile, File file) {
        String storedType = sanitizeFileName(resumeFile.getFileType()).toLowerCase();
        if (storedType.contains("/")) {
            return storedType;
        }

        try {
            String probedType = Files.probeContentType(file.toPath());
            if (probedType != null && !probedType.trim().isEmpty()) {
                return probedType;
            }
        } catch (IOException ignored) {
        }

        String guessedType = URLConnection.guessContentTypeFromName(file.getName());
        if (guessedType != null && !guessedType.trim().isEmpty()) {
            return guessedType;
        }

        if ("pdf".equals(storedType)) {
            return "application/pdf";
        }
        if ("doc".equals(storedType)) {
            return "application/msword";
        }
        if ("docx".equals(storedType)) {
            return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
        }

        return "application/octet-stream";
    }

    private String getFileExtension(String fileName) {
        String sanitized = sanitizeFileName(fileName);
        int dotIndex = sanitized.lastIndexOf('.');
        if (dotIndex < 0 || dotIndex == sanitized.length() - 1) {
            return "";
        }
        return sanitized.substring(dotIndex + 1).toLowerCase();
    }

    private String sanitizeFileName(String fileName) {
        if (fileName == null) {
            return "";
        }

        return fileName.trim().replaceAll("[\\\\/:*?\"<>|]", "_");
    }

    private void deletePhysicalFile(String filePath) {
        if (filePath == null || filePath.trim().isEmpty()) {
            return;
        }
        deletePhysicalFile(new File(filePath));
    }

    private void deletePhysicalFile(File file) {
        if (file == null || !file.exists()) {
            return;
        }
        try {
            Files.deleteIfExists(file.toPath());
        } catch (IOException ignored) {
        }
    }
}
