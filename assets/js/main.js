let activeTab = 'vCard'; // vCard or Link

let tabsButtons = document.querySelectorAll('.types-container button');
let forms = [...(document.querySelectorAll('[data-form-type]') ?? [])];

const downloadPNGButton = document.querySelector('#download-png');
const downloadSVGButton = document.querySelector('#download-svg');
let qrcodeCache;

tabsButtons.forEach(button => {
  button.addEventListener('click', () => {
    activeTab = button.dataset.type;
    forms.forEach(form => {
      if (form.dataset.formType === activeTab) {
        form.style.display = 'block';
      } else {
        form.style.display = 'none';
      }
    })
  });
});

forms.forEach(form => {
  form.addEventListener('submit', (event) => {
    event.preventDefault();

    if (activeTab === 'vCard') {
      // Validate and process vCard data
      const fd = new FormData(event.target);
      const obj = Object.fromEntries(fd);
      var vcardData = `BEGIN:VCARD\nVERSION:4.0\n`;
      vcardData += `N:${obj.last_name};${obj.first_name};;;\n`;
      vcardData += `FN:${obj.first_name} ${obj.last_name}\n`;
      if (obj.company) {
        vcardData += `ORG:${obj.company};\n`;
      }
      if (obj.email) {
        vcardData += `EMAIL;TYPE=INTERNET,WORK,pref:${obj.email}\n`;
      }
      if (obj.job) {
        vcardData += `TITLE:${obj.job};\n`;
      }
      if (obj.phone) {
        vcardData += `TEL;TYPE=WORK,VOICE:${obj.phone}\n`;
      }
      if (obj.cellphone) {
        vcardData += `TEL;TYPE=CELL,VOICE,pref:(47) 99999-9999\n`;
      }
      if (obj.address) {
        vcardData += `ADR;TYPE=WORK,pref:;;${obj.address};${obj.city};${obj.state};${obj.zip};${obj.country}\n`;
      }
      if (obj.website) {
        vcardData += `URL;TYPE=WORK:https://${obj.website}\n`;
      }
      vcardData += `END:VCARD\n`;

      qrcodeCache = new QRCode(document.getElementById("qrcode"), {
        text: vcardData,
        width: 128,
        height: 128,
        useSVG: true
      });
    }

    if (activeTab === 'link') {
      // Validate and process link data
    }
  });
});

downloadPNGButton.addEventListener('click', () => {
  const qrCode = document.querySelector("#qrcode img");
  const canvas = document.createElement("canvas");
  canvas.width = qrCode.clientWidth;
  canvas.height = qrCode.clientHeight;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(qrCode, 0, 0);
  const dataURL = canvas.toDataURL("image/png");
  const link = document.createElement("a");
  link.href = dataURL;
  link.download = "qrcode.png";
  link.click();
})

downloadSVGButton.addEventListener('click', () => {
  const qrCodeData = qrcodeCache._oQRCode.modules;
  let svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${qrCodeData.length} ${qrCodeData.length}" shape-rendering="crispEdges">`;
  qrCodeData.forEach((row, rowIndex) => {
    row.forEach((module, columnIndex) => {
      if (module) {
        svgContent += `<rect x="${columnIndex}" y="${rowIndex}" width="1" height="1" fill="black"/>`;
      }
    });
  });
  svgContent += '</svg>';
  const link = document.createElement("a");
  link.href = URL.createObjectURL(new Blob([svgContent], { type: "image/svg+xml" }));
  link.download = "qrcode.svg";
  link.click();
})