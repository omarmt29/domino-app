function detectDominoDots(canvas, ctx) {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // Convertir a escala de grises y binarizar
    for (let i = 0; i < data.length; i += 4) {
        const gray = (data[i] + data[i + 1] + data[i + 2]) / 3;
        const binary = gray > 128 ? 255 : 0; // Umbral simple
        data[i] = data[i + 1] = data[i + 2] = binary; // Blanco o negro
    }
    ctx.putImageData(imageData, 0, 0);

    const width = canvas.width;
    const height = canvas.height;

    const visited = new Set();
    let dotCount = 0;

    // Función para verificar si un píxel es negro
    function isBlack(x, y) {
        if (x < 0 || y < 0 || x >= width || y >= height) return false;
        const index = (y * width + x) * 4;
        return data[index] === 0; // Píxel negro
    }

    // Flood Fill para agrupar píxeles conectados
    function floodFill(x, y) {
        const stack = [[x, y]];
        const region = [];
        let minX = x, maxX = x, minY = y, maxY = y;

        while (stack.length > 0) {
            const [cx, cy] = stack.pop();
            const key = `${cx},${cy}`;
            if (visited.has(key)) continue;
            visited.add(key);
            region.push([cx, cy]);

            // Actualizar límites
            minX = Math.min(minX, cx);
            maxX = Math.max(maxX, cx);
            minY = Math.min(minY, cy);
            maxY = Math.max(maxY, cy);

            // Revisar vecinos
            for (const [dx, dy] of [[0, 1], [1, 0], [0, -1], [-1, 0]]) {
                const nx = cx + dx;
                const ny = cy + dy;
                if (isBlack(nx, ny)) stack.push([nx, ny]);
            }
        }

        const width = maxX - minX + 1;
        const height = maxY - minY + 1;

        return { region, width, height };
    }

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            if (isBlack(x, y) && !visited.has(`${x},${y}`)) {
                const { region, width, height } = floodFill(x, y);

                // Filtrar regiones por tamaño y forma
                const area = region.length;
                const aspectRatio = Math.max(width / height, height / width);

                if (area > 10 && area < 200 && aspectRatio < 1.5) {
                    dotCount++; // Contar como punto
                } else {
                    console.log(`Descartado: Area=${area}, AspectRatio=${aspectRatio}`);
                }
            }
        }
    }

    output.innerText = `Puntos detectados: ${dotCount}`;
    console.log(`Total de puntos detectados: ${dotCount}`);
}
