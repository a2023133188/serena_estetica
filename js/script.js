document.addEventListener('DOMContentLoaded', function () {
    iniciarFormularioContacto();
    iniciarFiltroTabela();
    iniciarVoltarAoTopo();
});

function iniciarFormularioContacto() {
    var form = document.getElementById('form-contacto');
    if (!form) return;

    var params = new URLSearchParams(window.location.search);
    var assuntoUrl = params.get('assunto');
    var selectAssunto = document.getElementById('assunto');
    if (assuntoUrl && selectAssunto.querySelector('option[value="' + assuntoUrl + '"]')) {
        selectAssunto.value = assuntoUrl;
    }

    var regras = {
        nome: function (v) {
            if (v.trim().length < 3) return 'Indique o seu nome completo (mínimo 3 caracteres).';
            if (!/^[A-Za-zÀ-ÿ' -]+$/.test(v.trim())) return 'O nome só pode conter letras.';
            return '';
        },
        email: function (v) {
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim())) return 'Indique um email válido (ex.: nome@email.com).';
            return '';
        },
        telefone: function (v) {
            //só valida se for preenchido
            if (v.trim() === '') return '';
            var digitos = v.replace(/[\s+()-]/g, '');
            if (!/^\d{9,13}$/.test(digitos)) return 'Indique um número de telefone válido (9 a 13 dígitos).';
            return '';
        },
        assunto: function (v) {
            if (v === '') return 'Selecione o serviço ou assunto.';
            return '';
        },
        mensagem: function (v) {
            if (v.trim().length < 10) return 'A mensagem deve ter pelo menos 10 caracteres.';
            return '';
        }
    };

    function validarCampo(campo) {
        var erro = regras[campo.id](campo.value);
        mostrarErro(campo, erro);
        return erro === '';
    }

    function mostrarErro(campo, texto) {
        var grupo = campo.closest('.grupo-form');
        var aviso = grupo.querySelector('.msg-erro');
        if (!aviso) {
            aviso = document.createElement('span');
            aviso.className = 'msg-erro';
            aviso.setAttribute('role', 'alert');
            grupo.appendChild(aviso);
        }
        aviso.textContent = texto;
        campo.classList.toggle('campo-invalido', texto !== '');
        campo.setAttribute('aria-invalid', texto !== '' ? 'true' : 'false');
    }

    Object.keys(regras).forEach(function (id) {
        var campo = document.getElementById(id);
        campo.addEventListener('blur', function () { validarCampo(campo); });
        campo.addEventListener('input', function () {
            if (campo.classList.contains('campo-invalido')) validarCampo(campo);
        });
    });

    var mensagem = document.getElementById('mensagem');
    var contador = document.createElement('small');
    contador.className = 'contador';
    mensagem.closest('.grupo-form').appendChild(contador);
    function atualizarContador() {
        contador.textContent = mensagem.value.length + ' / 500 caracteres';
    }
    mensagem.setAttribute('maxlength', '500');
    mensagem.addEventListener('input', atualizarContador);
    atualizarContador();

    form.addEventListener('submit', function (e) {
        e.preventDefault();
        var primeiroErro = null;
        Object.keys(regras).forEach(function (id) {
            var campo = document.getElementById(id);
            if (!validarCampo(campo) && !primeiroErro) primeiroErro = campo;
        });

        if (primeiroErro) {
            primeiroErro.focus();
            return;
        }

        var nome = document.getElementById('nome').value.trim().split(' ')[0];
        var sucesso = document.createElement('div');
        sucesso.className = 'msg-sucesso';
        sucesso.setAttribute('role', 'status');
        sucesso.innerHTML = '<strong>Obrigada, ' + escaparHtml(nome) + '!</strong> ' +
            'O seu pedido foi enviado com sucesso. Responderemos o mais brevemente possível.';
        form.parentNode.insertBefore(sucesso, form);
        form.reset();
        atualizarContador();
        form.querySelectorAll('.campo-invalido').forEach(function (c) { c.classList.remove('campo-invalido'); });
        form.querySelectorAll('.msg-erro').forEach(function (m) { m.textContent = ''; });
        sucesso.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(function () { sucesso.remove(); }, 8000);
    });
}

function escaparHtml(texto) {
    var d = document.createElement('div');
    d.textContent = texto;
    return d.innerHTML;
}


function iniciarFiltroTabela() {
    var campo = document.getElementById('filtro-servico');
    var tabela = document.querySelector('.tabela-precos');
    if (!campo || !tabela) return;

    var aviso = document.getElementById('filtro-vazio');
    var linhas = tabela.querySelectorAll('tbody tr');

    function normalizar(t) {
        return t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
    }

    campo.addEventListener('input', function () {
        var termo = normalizar(campo.value.trim());
        var visiveis = 0;
        linhas.forEach(function (linha) {
            var mostrar = normalizar(linha.textContent).indexOf(termo) !== -1;
            linha.style.display = mostrar ? '' : 'none';
            if (mostrar) visiveis++;
        });
        aviso.hidden = visiveis !== 0;
    });
}


function iniciarVoltarAoTopo() {
    var botao = document.createElement('button');
    botao.type = 'button';
    botao.className = 'btn-topo';
    botao.setAttribute('aria-label', 'Voltar ao topo');
    botao.textContent = '↑';
    document.body.appendChild(botao);

    window.addEventListener('scroll', function () {
        botao.classList.toggle('visivel', window.scrollY > 300);
    });
    botao.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}
