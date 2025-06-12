// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract GerenciadorDePagamentos {
    struct Pagamento {
        string id;
        uint256 valor;
        string descricao;
        uint256 data;
        bool ativo;
        string idGrupo;
    }

    mapping(address => string) public grupoDoUsuario;
    mapping(string => address[]) public participantesDoGrupo;
     mapping(string => bool) public grupoExiste;
    mapping(address => Pagamento[]) public pagamentos;
    
    // Criar novo grupo (usuário é adicionado automaticamente)
    function criarGrupo(string memory idGrupo) public {
        require(!grupoExiste[idGrupo], "Grupo ja existe");
        require(bytes(grupoDoUsuario[msg.sender]).length == 0, "Usuario ja pertence a um grupo");

        grupoExiste[idGrupo] = true;
        grupoDoUsuario[msg.sender] = idGrupo;
        participantesDoGrupo[idGrupo].push(msg.sender);
    }

    // Entrar em um grupo (só pode um grupo por usuário)
    function entrarNoGrupo(string memory idGrupo) public {
        require(grupoExiste[idGrupo], "Grupo nao existe");
        require(bytes(grupoDoUsuario[msg.sender]).length == 0, "Usuario ja pertence a um grupo");

        grupoDoUsuario[msg.sender] = idGrupo;
        participantesDoGrupo[idGrupo].push(msg.sender);
    }

    // Registrar novo pagamento
    function registrarPagamento(
        string memory id,
        uint256 valor,
        string memory descricao
    ) public {
        string memory idGrupo = grupoDoUsuario[msg.sender];
        require(bytes(idGrupo).length > 0, "Usuario nao pertence a um grupo");

        pagamentos[msg.sender].push(Pagamento({
            id: id,
            valor: valor,
            descricao: descricao,
            data: block.timestamp,
            ativo: true,
            idGrupo: idGrupo
        }));
    }

    // Apagar pagamento (define ativo = false)
    function apagarPagamento(string memory id) public {
        Pagamento[] storage lista = pagamentos[msg.sender];

        for (uint i = 0; i < lista.length; i++) {
            if (keccak256(bytes(lista[i].id)) == keccak256(bytes(id)) && lista[i].ativo) {
                lista[i].ativo = false;
                return;
            }
        }

        revert("Pagamento nao encontrado");
    }

    // Editar pagamento (adiciona um novo com mesmo id)
    function editarPagamento(string memory id, uint256 novoValor, string memory novaDescricao) public {
        string memory idGrupo = grupoDoUsuario[msg.sender];
        require(bytes(idGrupo).length > 0, "Usuario nao pertence a um grupo");

        // Marca os antigos como inativos
        Pagamento[] storage lista = pagamentos[msg.sender];
        for (uint i = 0; i < lista.length; i++) {
            if (keccak256(bytes(lista[i].id)) == keccak256(bytes(id)) && lista[i].ativo) {
                lista[i].ativo = false;
            }
        }

        // Adiciona o novo
        pagamentos[msg.sender].push(Pagamento({
            id: id,
            valor: novoValor,
            descricao: novaDescricao,
            data: block.timestamp,
            ativo: true,
            idGrupo: idGrupo
        }));
    }

    // Listar pagamentos ativos do grupo atual do usuário
    function listarPagamentosDoMeuGrupo() public view returns (Pagamento[] memory) {
        string memory idGrupo = grupoDoUsuario[msg.sender];
        require(bytes(idGrupo).length > 0, "Usuario nao pertence a nenhum grupo");

        address[] memory membros = participantesDoGrupo[idGrupo];

        uint total = 0;
        for (uint i = 0; i < membros.length; i++) {
            Pagamento[] memory lista = pagamentos[membros[i]];
            for (uint j = 0; j < lista.length; j++) {
                if (lista[j].ativo && keccak256(bytes(lista[j].idGrupo)) == keccak256(bytes(idGrupo))) {
                    total++;
                }
            }
        }

        Pagamento[] memory resultado = new Pagamento[](total);
        uint k = 0;
        for (uint i = 0; i < membros.length; i++) {
            Pagamento[] memory lista = pagamentos[membros[i]];
            for (uint j = 0; j < lista.length; j++) {
                if (lista[j].ativo && keccak256(bytes(lista[j].idGrupo)) == keccak256(bytes(idGrupo))) {
                    resultado[k] = lista[j];
                    k++;
                }
            }
        }

        return resultado;
    }

    // Obter grupo atual do usuário
    function meuGrupo() public view returns (string memory) {
        return grupoDoUsuario[msg.sender];
    }
}
