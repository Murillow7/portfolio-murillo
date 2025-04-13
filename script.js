const canvas = document.getElementById("matrix");
const ctx = canvas.getContext("2d");

canvas.height = window.innerHeight;
canvas.width = window.innerWidth;

const letters = "01";
const fontSize = 14;
const columns = canvas.width / fontSize;
const drops = Array(Math.floor(columns)).fill(1);

function drawMatrix() {
  ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#0F0";
  ctx.font = fontSize + "px monospace";

  for (let i = 0; i < drops.length; i++) {
    const text = letters.charAt(Math.floor(Math.random() * letters.length));
    ctx.fillText(text, i * fontSize, drops[i] * fontSize);

    if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
      drops[i] = 0;
    }

    drops[i]++;
  }
}

setInterval(drawMatrix, 33);

const terminalOutput = document.getElementById("hacker-output");
let commandQueue = [];

function typeCommandQueue() {
  if (commandQueue.length > 0) {
    const line = commandQueue.shift();
    let idx = 0;
    const typer = setInterval(() => {
      if (idx < line.length) {
        terminalOutput.innerHTML += line.charAt(idx);
        idx++;
      } else {
        clearInterval(typer);
        terminalOutput.innerHTML += "\n";
        typeCommandQueue();
      }
    }, 50);
  }
}

function getLocationDetails(lat, lon) {
  fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`)
    .then(response => response.json())
    .then(data => {
      const { road, suburb, city, town, village, postcode } = data.address;
      const locationName = city || town || village || "sua cidade";
      const locationString = `${road || ''}, ${suburb || ''}, ${locationName}, CEP: ${postcode || ''}`;

      fetch('https://api.ipify.org?format=json')
        .then(res => res.json())
        .then(ipData => {
          const browser = navigator.userAgent;
          const os = navigator.platform;
          const language = navigator.language;
          const resolution = `${window.screen.width}x${window.screen.height}`;
          const time = new Date().toLocaleString();

          commandQueue = [
            `Olá, visitante de ${locationName}!`,
            `\n[+] Iniciando varredura...`,
            `[+] Localização aproximada:`,
            `${locationString}`,
            `[+] IP Público: ${ipData.ip}`,
            `[+] Sistema Operacional: ${os}`,
            `[+] Navegador: ${browser}`,
            `[+] Idioma: ${language}`,
            `[+] Resolução da Tela: ${resolution}`,
            `[+] Hora Local: ${time}`,
            `\n[+] Estabelecendo conexão segura...`
          ];
          typeCommandQueue();
        });
    })
    .catch(err => {
      terminalOutput.innerHTML += `\n// Erro ao buscar endereço detalhado\n\n`;
      typeCommandQueue();
    });
}

function showLocationInTerminal(position) {
  const { latitude, longitude } = position.coords;
  getLocationDetails(latitude, longitude);
}

function showError(error) {
  terminalOutput.innerHTML += `\n// Falha ao obter localização: ${error.message}\n\n`;
}

if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(showLocationInTerminal, showError);
} else {
  terminalOutput.innerHTML += "\n// Geolocalização não suportada pelo navegador\n\n";
}
