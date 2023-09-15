const url = "http://localhost:3400/produtos";
let modoEdicao = false;

let listaProdutos = [];

let btnAdicionar = document.querySelector("#btn-adicionar");
let meusProdutos = document.querySelector(".grid");
let modalProduto = new bootstrap.Modal(
  document.getElementById("modal-produto"),
  {}
);
let tituloModal = document.querySelector("h4.modal-title");

let btnSalvar = document.querySelector("#btn-salvar");
let btnCancelar = document.querySelector("#btn-cancelar");

let formModal = {
  id: document.getElementById("id"),
  nome: document.getElementById("produto"),
  valor: document.getElementById("valor"),
  quantidadeEstoque: document.getElementById("quantidade"),
  observacao: document.getElementById("descricao"),
};

btnAdicionar.addEventListener("click", () => {
  modoEdicao = false;
  tituloModal.textContent = "Adicionar Produto";
  limparModalProduto();
  modalProduto.show();
});

btnSalvar.addEventListener("click", () => {
  let produto = obterProdutosDoModal();
  if (!produto.nome || !produto.quantidadeEstoque) {
    alert("Preencha todos os campos!");
    return;
  }

  if (modoEdicao) {
    atualizarProdutoBackEnd(produto);
  } else {
    adicionarProdutoBackEnd(produto);
  }
});

btnCancelar.addEventListener("click", () => {
  modalProduto.hide();
});

function obterProdutosDoModal() {
  // id, produto, valor, quantidade, descrição do produto
  return new Produtos({
    id: formModal.id.value,
    nome: formModal.nome.value,
    valor: formModal.valor.value,
    quantidadeEstoque: formModal.quantidadeEstoque.value,
    observacao: formModal.observacao.value,
  });
}

function obterProdutos() {
  fetch(url, {
    method: "GET",
    headers: {
      Authorization: "token",
    },
  })
    .then((response) => response.json())
    .then((response) => {
      listaProdutos = response;
      adicionarProdutos(listaProdutos);
    })
    .catch((error) => {
      console.error(error);
    });
}

function editarProduto(id) {
  modoEdicao = true;
  tituloModal.textContent = "Editar Produto";

  let produto = listaProdutos.find((produto) => produto.id == id);

  atualizarModalProduto(produto);

  modalProduto.show();
}

function atualizarModalProduto(produto) {
  formModal.id.value = produto.id;
  formModal.nome.value = produto.nome;
  formModal.valor.value = produto.valor;
  formModal.quantidadeEstoque.value = produto.quantidadeEstoque;
  formModal.observacao.value = produto.observacao;
}

function limparModalProduto() {
  formModal.id.value = "";
  formModal.nome.value = "";
  formModal.valor.value = "";
  formModal.quantidadeEstoque.value = "";
  formModal.observacao.value = "";
}

function excluirProduto(id) {
  let produto = listaProdutos.find((p) => p.id == id);

  if (confirm("Deseja realmente excluir o produto " + produto.nome)) {
    excluirProdutoBackEnd(produto);
  }
}

function criarProdutos(produto) {
  //Div
  let div = document.createElement("div");
  //Titulo
  let h2 = document.createElement("h2");
  //Descrição completa do Produto
  let id = document.createElement("p");
  let preco = document.createElement("p");
  let descricao = document.createElement("p");
  let qtdestoque = document.createElement("p");
  let botoes = document.createElement("button");

  //Atualizar dados
  id.textContent = produto.id;
  h2.textContent = produto.nome;
  preco.textContent = produto.valor;
  descricao.textContent = produto.observacao;
  qtdestoque.textContent = produto.quantidadeEstoque;

  botoes.innerHTML = `<button class="comprar">Comprar</button>
 <button onclick="editarProduto(${produto.id})" type="button" class="btn btn-outline-secondary">Editar</button>
 <button onclick="excluirProduto(${produto.id})" type="button" class="btn btn-dark">Excluir</button>`;

  div.appendChild(h2);
  // div.appendChild(id);
  div.appendChild(preco);
  div.appendChild(descricao);
  div.appendChild(qtdestoque);
  div.appendChild(botoes);

  meusProdutos.appendChild(div);
}

function adicionarProdutos(produtos) {
  meusProdutos.textContent = "";

  listaProdutos.forEach((produto) => {
    criarProdutos(produto);
  });
}

function adicionarProdutoBackEnd(produto) {
  fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "token",
    },
    body: JSON.stringify(produto),
  })
    .then((response) => response.json())
    .then((response) => {
      let novoProduto = new Produtos(response);

      listaProdutos.push(novoProduto);

      adicionarProdutos(listaProdutos);

      modalProduto.hide();
    })
    .catch((error) => {
      console.log(error);
    });
}

function atualizarProdutoBackEnd(produto) {
  fetch(`${url}/${produto.id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: "token",
    },
    body: JSON.stringify(produto),
  })
    .then((response) => response.json())
    .then(() => {
      atualizarProdutoNaLista(produto, false);
      modalProduto.hide();
    })
    .catch((error) => {
      console.log(error);
    });
}

function excluirProdutoBackEnd(produto) {
  fetch(`${url}/${produto.id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: "token",
    },
  })
    .then((response) => response.json())
    .then(() => {
      atualizarProdutoNaLista(produto, true);
      obterProdutos();
      modalProduto.hide();
    })
    .catch((error) => {
      console.log(error);
    });
}

function atualizarProdutoNaLista(produto, removerProduto) {
  let indice = listaProdutos.findIndex((p) => p.id == produto.id);

  removerProduto
    ? listaProdutos.splice(indice, 1)
    : listaProdutos.splice(indice, 1, produto);

  adicionarProdutos(listaProdutos);
}

obterProdutos();
class Produtos {
  constructor(obj) {
    obj = obj || {};

    this.id = obj.id;
    this.nome = obj.nome;
    this.valor = obj.valor;
    this.quantidadeEstoque = obj.quantidadeEstoque;
    this.observacao = obj.observacao;
  }
}
