const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const btnEntrar = document.getElementById("btnEntrar");

const modal = document.getElementById("modal");
const mensagemModal = document.getElementById("mensagemModal");
const fecharModal = document.getElementById("fecharModal");

const loading = document.getElementById("loading");

function mostrarLoading() {
    loading.style.display = "flex";
}

function esconderLoading() {
    loading.style.display = "none";
}

function abrirModal(mensagem) {
    mensagemModal.textContent = mensagem;
    modal.style.display = "flex";
}

function fecharJanelaModal() {
    modal.style.display = "none";
}

fecharModal.addEventListener(
    "click",
    fecharJanelaModal
);

window.addEventListener("click", (event) => {
    if (event.target === modal) {
        fecharJanelaModal();
    }
});

let validacaoRealizada = false;

// Inicia webcam
async function iniciarCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: true
        });

        video.srcObject = stream;

    } catch (erro) {
        console.error("Erro ao acessar a câmera:", erro);
        alert("Não foi possível acessar a câmera.");
    }
}

// Captura frame e envia para API
async function enviarFrame() {

    if (validacaoRealizada) return;

    if (!video.videoWidth || !video.videoHeight) {
        alert("A câmera ainda não está pronta.");
        return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");

    ctx.drawImage(
        video,
        0,
        0,
        canvas.width,
        canvas.height
    );

    const imagemBase64 = canvas.toDataURL(
        "image/jpeg",
        0.8
    );

    try {

        btnEntrar.disabled = true;
        btnEntrar.textContent = "Validando...";
        mostrarLoading();

        const response = await fetch(
            "http://127.0.0.1:5000/verificar-face",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    imagem: imagemBase64
                })
            }
        );

        const resultado = await response.json();

        console.log(resultado);

        if (resultado.autorizado) {

            validacaoRealizada = true;

            esconderLoading();

            abrirModal("Acesso liberado!");

            
            const dataHora = capturarDataHora();
            console.log(dataHora);
            window.location.href = "https://syskall-sistema-biblioteca.vercel.app/"

            
            btnEntrar.disabled = false;
            btnEntrar.textContent = "Posicione seu rosto dentro da câmera e clique em Entrar";

            //window.location.href = "home.html";

        } else {

            esconderLoading();
            abrirModal("Face não reconhecida. Tente novamente.");
            btnEntrar.textContent = "Tente Novamente";

        }

    } catch (erro) {

        console.error("Erro ao validar rosto:", erro);
        alert("Erro ao validar rosto.");

    } finally {

        esconderLoading();
        if (!validacaoRealizada) {
            btnEntrar.disabled = false;
        }

    }
}

// Inicialização
(async () => {
    await iniciarCamera();
})();

function capturarDataHora() {
    const agora = new Date();

    return {
        data: agora.toLocaleDateString("pt-BR"),
        hora: agora.toLocaleTimeString("pt-BR"),
        dataHoraCompleta: agora.toLocaleString("pt-BR")
    };
}

// Clique do botão
//btnEntrar.addEventListener("click", enviarFrame);

