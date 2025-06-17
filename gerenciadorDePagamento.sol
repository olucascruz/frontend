// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract GerenciadorDePagamentos {
    struct Pagamento {
        uint256 valor;
        string descricao;
        uint256 data;
        bool ativo;
        string idGrupo;
        string tipo;
        address pagador;
    }

    struct Grupo {
        string idGrupo;
        address[] participantes;
        bool existe;
    }

    mapping(address => string) public grupoDoUsuario;
    mapping(string => address[]) public participantesDoGrupo;
    mapping(string => bool) public grupoExiste;
    mapping(address => Pagamento[]) public pagamentos;

    string[] public listaDeGrupos;

    function criarGrupo(string memory idGrupo) public {
        require(!grupoExiste[idGrupo], "Grupo ja existe");
        require(bytes(grupoDoUsuario[msg.sender]).length == 0, "Usuario ja pertence a um grupo");

        grupoExiste[idGrupo] = true;
        grupoDoUsuario[msg.sender] = idGrupo;
        participantesDoGrupo[idGrupo].push(msg.sender);
        listaDeGrupos.push(idGrupo);
    }

    function entrarNoGrupo(string memory idGrupo) public {
        require(grupoExiste[idGrupo], "Grupo nao existe");
        require(bytes(grupoDoUsuario[msg.sender]).length == 0, "Usuario ja pertence a um grupo");

        grupoDoUsuario[msg.sender] = idGrupo;
        participantesDoGrupo[idGrupo].push(msg.sender);
    }

    function registrarPagamento(
        uint256 valor,
        string memory descricao,
        string memory tipo
    ) public {
        string memory idGrupo = grupoDoUsuario[msg.sender];
        require(bytes(idGrupo).length > 0, "Usuario nao pertence a um grupo");

        pagamentos[msg.sender].push(Pagamento({
            valor: valor,
            descricao: descricao,
            data: block.timestamp,
            ativo: true,
            idGrupo: idGrupo,
            tipo: tipo,
            pagador: msg.sender
        }));
    }

    // Agora apaga pagamento pelo índice na lista do usuário
    function apagarPagamento(uint256 index) public {
        Pagamento[] storage lista = pagamentos[msg.sender];
        require(index < lista.length, "Indice invalido");
        require(lista[index].ativo, "Pagamento ja apagado");
        lista[index].ativo = false;
    }

    // Edita pagamento pelo índice, desativa o antigo e cria novo registro
    function editarPagamento(
        uint256 index,
        uint256 novoValor,
        string memory novaDescricao,
        string memory novoTipo
    ) public {
        string memory idGrupo = grupoDoUsuario[msg.sender];
        require(bytes(idGrupo).length > 0, "Usuario nao pertence a um grupo");

        Pagamento[] storage lista = pagamentos[msg.sender];
        require(index < lista.length, "Indice invalido");
        require(lista[index].ativo, "Pagamento nao ativo");

        lista[index].ativo = false;

        pagamentos[msg.sender].push(Pagamento({
            valor: novoValor,
            descricao: novaDescricao,
            data: block.timestamp,
            ativo: true,
            idGrupo: idGrupo,
            tipo: novoTipo,
            pagador: msg.sender
        }));
    }

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

    function listarPagamentosPessoais() public view returns (Pagamento[] memory) {
        return pagamentos[msg.sender];
    }

    function meuGrupo() public view returns (Grupo memory) {
        string memory idGrupo = grupoDoUsuario[msg.sender];
        require(bytes(idGrupo).length > 0, "Usuario nao pertence a nenhum grupo");

        return Grupo({
            idGrupo: idGrupo,
            participantes: participantesDoGrupo[idGrupo],
            existe: grupoExiste[idGrupo]
        });
    }

    function listarGrupos() public view returns (string[] memory) {
        return listaDeGrupos;
    }
}
