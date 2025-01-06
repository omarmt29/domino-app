// Asegúrate de que OpenCV.js esté cargado antes de usarlo
if (typeof cv === 'undefined') {
    console.error('OpenCV.js no se ha cargado correctamente.');
} else {
    // Acceder a la cámara
    navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
        const video = document.getElementById('video');
        const canvas = document.getElementById('canvas');
        const canvasOutput = document.getElementById('canvasOutput');
        const ctx = canvas.getContext('2d');

        // Establecer el tamaño del canvas para que coincida con el tamaño del video
        video.srcObject = stream;
        video.play();

        video.addEventListener('play', () => {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            setInterval(() => {
                // Dibujar el fotograma actual del video en el canvas
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

                // Procesar la imagen con OpenCV.js
                const src = cv.imread(canvas);
                const dst = new cv.Mat();

                // Convertir a escala de grises
                cv.cvtColor(src, dst, cv.COLOR_RGBA2GRAY);

                // Aplicar un filtro de umbral para mejorar el contraste
                cv.threshold(dst, dst, 100, 255, cv.THRESH_BINARY);

                // Detectar contornos
                const contours = new cv.MatVector();
                const hierarchy = new cv.Mat();
                cv.findContours(dst, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);

                // Dibujar los contornos en el canvas de salida
                const output = new cv.Mat();
                cv.cvtColor(dst, output, cv.COLOR_GRAY2RGBA);
                for (let i = 0; i < contours.size(); i++) {
                    const color = new cv.Scalar(0, 255, 0, 255);
                    cv.drawContours(output, contours, i, color, 2, cv.LINE_8, hierarchy, 0);
                }
                cv.imshow('canvasOutput', output);

                // Limpiar la memoria
                src.delete();
                dst.delete();
                contours.delete();
                hierarchy.delete();
                output.delete();
            }, 100);
        });
    }).catch((err) => {
        console.error('Error al acceder a la cámara:', err);
    });
}
