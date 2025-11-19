package com.TCC.Prato_Justo.Service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class FileUploadService {

    @Value("${upload.dir}")
    private String uploadDir;

    /**
     * Salva um arquivo de imagem e retorna a URL
     */
    public String saveAvatar(MultipartFile file, Long userId) throws IOException {
        // Validar arquivo
        if (file.isEmpty()) {
            throw new IOException("Arquivo vazio");
        }

        // Validar tipo de arquivo
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new IOException("O arquivo deve ser uma imagem");
        }

        // Validar tamanho (5MB)
        long maxSize = 5 * 1024 * 1024; // 5MB em bytes
        if (file.getSize() > maxSize) {
            throw new IOException("O arquivo deve ter no máximo 5MB");
        }

        // Criar diretório se não existir
        File uploadDirFile = new File(uploadDir);
        if (!uploadDirFile.exists()) {
            uploadDirFile.mkdirs();
            System.out.println("📁 Diretório criado: " + uploadDirFile.getAbsolutePath());
        }

        // Gerar nome fixo baseado no userId para substituir arquivo antigo
        String originalFilename = file.getOriginalFilename();
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        
        // Usar nome fixo para substituir arquivo antigo automaticamente
        String filename = "user_" + userId + extension;
        Path filePath = Paths.get(uploadDir, filename);
        
        // Deletar arquivo antigo se existir (pode ter extensão diferente ou UUID)
        if (uploadDirFile.exists()) {
            File[] oldFiles = uploadDirFile.listFiles((dir, name) -> {
                // Buscar arquivos que começam com "user_" + userId + "_" ou "user_" + userId + "."
                return name.startsWith("user_" + userId + "_") || 
                       (name.startsWith("user_" + userId) && !name.equals(filename));
            });
            if (oldFiles != null) {
                for (File oldFile : oldFiles) {
                    if (!oldFile.getName().equals(filename)) {
                        oldFile.delete();
                        System.out.println("🗑️ Avatar antigo deletado: " + oldFile.getName());
                    }
                }
            }
        }

        // Salvar arquivo
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        System.out.println("✅ Avatar salvo: " + filePath);

        // Retornar URL
        return "/uploads/avatars/" + filename;
    }

    /**
     * Deleta um avatar antigo
     */
    public void deleteAvatar(String avatarUrl) {
        if (avatarUrl == null || avatarUrl.isEmpty() || !avatarUrl.startsWith("/uploads/")) {
            return;
        }

        try {
            // Extrair nome do arquivo da URL
            String filename = avatarUrl.substring(avatarUrl.lastIndexOf("/") + 1);
            Path filePath = Paths.get(uploadDir, filename);
            
            if (Files.deleteIfExists(filePath)) {
                System.out.println("🗑️ Avatar antigo deletado: " + filename);
            }
        } catch (Exception e) {
            System.err.println("⚠️ Erro ao deletar avatar: " + e.getMessage());
        }
    }

    /**
     * Salva uma imagem de alimento e retorna a URL
     */
    public String saveFoodImage(MultipartFile file, Long doacaoId) throws IOException {
        // Validar arquivo
        if (file.isEmpty()) {
            throw new IOException("Arquivo vazio");
        }

        // Validar tipo de arquivo
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new IOException("O arquivo deve ser uma imagem");
        }

        // Validar tamanho (5MB)
        long maxSize = 5 * 1024 * 1024; // 5MB em bytes
        if (file.getSize() > maxSize) {
            throw new IOException("O arquivo deve ter no máximo 5MB");
        }

        // Obter diretório raiz de uploads (pai do uploadDir)
        File uploadDirFile = new File(uploadDir);
        File rootUploadDir = uploadDirFile.getParentFile();
        if (rootUploadDir == null) {
            rootUploadDir = new File("./uploads");
        }

        // Criar subdiretório para imagens de alimentos
        File foodImagesDirFile = new File(rootUploadDir, "alimentos");
        if (!foodImagesDirFile.exists()) {
            foodImagesDirFile.mkdirs();
            System.out.println("📁 Diretório de alimentos criado: " + foodImagesDirFile.getAbsolutePath());
        }

        // Gerar nome do arquivo
        String originalFilename = file.getOriginalFilename();
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        
        String filename;
        if (doacaoId != null) {
            // Se doacaoId fornecido, usar nome fixo para substituir arquivo antigo
            filename = "food_" + doacaoId + extension;
            
            // Deletar arquivo antigo se existir (pode ter extensão diferente ou UUID)
            File[] oldFiles = foodImagesDirFile.listFiles((dir, name) -> {
                // Buscar arquivos que começam com "food_" + doacaoId + "_" ou "food_" + doacaoId + "."
                return name.startsWith("food_" + doacaoId + "_") || 
                       (name.startsWith("food_" + doacaoId) && !name.equals(filename));
            });
            if (oldFiles != null) {
                for (File oldFile : oldFiles) {
                    if (!oldFile.getName().equals(filename)) {
                        oldFile.delete();
                        System.out.println("🗑️ Imagem de alimento antiga deletada: " + oldFile.getName());
                    }
                }
            }
        } else {
            // Para novas doações, usar UUID temporário (será renomeado após salvar)
            filename = "food_temp_" + UUID.randomUUID().toString() + extension;
        }
        
        Path filePath = Paths.get(foodImagesDirFile.getAbsolutePath(), filename);

        // Salvar arquivo
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        System.out.println("✅ Imagem de alimento salva: " + filePath);

        // Retornar URL
        return "/uploads/alimentos/" + filename;
    }

    /**
     * Deleta uma imagem de alimento
     */
    public void deleteFoodImage(String imageUrl) {
        if (imageUrl == null || imageUrl.isEmpty() || !imageUrl.startsWith("/uploads/")) {
            return;
        }

        try {
            // Obter diretório raiz de uploads
            File uploadDirFile = new File(uploadDir);
            File rootUploadDir = uploadDirFile.getParentFile();
            if (rootUploadDir == null) {
                rootUploadDir = new File("./uploads");
            }

            // Extrair nome do arquivo da URL
            String filename = imageUrl.substring(imageUrl.lastIndexOf("/") + 1);
            File foodImagesDir = new File(rootUploadDir, "alimentos");
            Path filePath = Paths.get(foodImagesDir.getAbsolutePath(), filename);
            
            if (Files.deleteIfExists(filePath)) {
                System.out.println("🗑️ Imagem de alimento deletada: " + filename);
            }
        } catch (Exception e) {
            System.err.println("⚠️ Erro ao deletar imagem de alimento: " + e.getMessage());
        }
    }

    /**
     * Renomeia um arquivo temporário de alimento para usar o ID da doação
     */
    public String renameFoodImage(String tempImageUrl, Long doacaoId) {
        if (tempImageUrl == null || tempImageUrl.isEmpty() || !tempImageUrl.startsWith("/uploads/")) {
            return tempImageUrl;
        }

        try {
            // Obter diretório raiz de uploads
            File uploadDirFile = new File(uploadDir);
            File rootUploadDir = uploadDirFile.getParentFile();
            if (rootUploadDir == null) {
                rootUploadDir = new File("./uploads");
            }

            File foodImagesDir = new File(rootUploadDir, "alimentos");
            
            // Extrair nome do arquivo temporário da URL
            String tempFilename = tempImageUrl.substring(tempImageUrl.lastIndexOf("/") + 1);
            
            // Verificar se é um arquivo temporário
            if (!tempFilename.startsWith("food_temp_")) {
                return tempImageUrl; // Não é temporário, retornar como está
            }

            // Extrair extensão
            String extension = "";
            if (tempFilename.contains(".")) {
                extension = tempFilename.substring(tempFilename.lastIndexOf("."));
            }

            // Criar novo nome baseado no doacaoId
            String newFilename = "food_" + doacaoId + extension;
            
            Path oldPath = Paths.get(foodImagesDir.getAbsolutePath(), tempFilename);
            Path newPath = Paths.get(foodImagesDir.getAbsolutePath(), newFilename);

            // Renomear arquivo
            if (Files.exists(oldPath)) {
                Files.move(oldPath, newPath, StandardCopyOption.REPLACE_EXISTING);
                System.out.println("✅ Arquivo renomeado: " + tempFilename + " -> " + newFilename);
                return "/uploads/alimentos/" + newFilename;
            }
        } catch (Exception e) {
            System.err.println("⚠️ Erro ao renomear imagem de alimento: " + e.getMessage());
        }

        return tempImageUrl;
    }
}

