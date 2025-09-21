package com.TCC.Prato_Justo.Controller;

import com.TCC.Prato_Justo.Model.Usuario;
import com.TCC.Prato_Justo.Service.UsuarioService;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@CrossOrigin(originPatterns = "*")
public class AuthController {
    private final UsuarioService usuarioService;

    public AuthController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    @PostMapping("/register")
    public Usuario register(@RequestBody Usuario usuario) {
        return usuarioService.cadastrarLogin(usuario);
    }


        @PostMapping("/login")
        public ResponseEntity<String> login(@RequestBody Usuario usuario){
            Usuario user = usuarioService.fazerLogin(usuario.getUsername(), usuario.getPassword());
            if(user != null){
                return ResponseEntity.ok("Login realizado com sucesso");
            }
            return ResponseEntity.status(401).body("Usuário ou senha inválidos");
        }
    }


