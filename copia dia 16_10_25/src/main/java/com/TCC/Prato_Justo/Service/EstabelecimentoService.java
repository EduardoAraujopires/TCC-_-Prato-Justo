package com.TCC.Prato_Justo.Service;

import com.TCC.Prato_Justo.Interface.AnthEstabelecimentoRepository;
import com.TCC.Prato_Justo.Model.Estabelecimento;
import org.springframework.stereotype.Service;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.util.List;
import java.util.Optional;


@Service
public class EstabelecimentoService {

        private final AnthEstabelecimentoRepository estabelecimentoRepository;
        private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public EstabelecimentoService(AnthEstabelecimentoRepository anthEstabelecimentoRepository) {
        this.estabelecimentoRepository = anthEstabelecimentoRepository;
    }


    // Criar ou atualizar
        public Estabelecimento salvar(Estabelecimento estabelecimento) {
            if (estabelecimento.getSenhaEstabelecimento() != null
                    && !estabelecimento.getSenhaEstabelecimento().startsWith("$2a$")) {
                estabelecimento.setSenhaEstabelecimento(
                        passwordEncoder.encode(estabelecimento.getSenhaEstabelecimento())
                );
            }
            return estabelecimentoRepository.save(estabelecimento);
        }

        // Listar todos
        public List<Estabelecimento> listarTodos() {
            return estabelecimentoRepository.findAll();
        }

        // Buscar por ID
        public Optional<Estabelecimento> buscarPorId(Long id) {
            return estabelecimentoRepository.findById(id);
        }

        // Deletar
        public void deletar(Long id) {
            estabelecimentoRepository.deleteById(id);
        }
    }



