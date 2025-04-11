<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Chroiscraft</title>
  <style>
    html, body, canvas {
      margin: 0;
      padding: 0;
      width: 100%;
      height: 100%;
      display: block;
    }
  </style>
</head>
<body>
  <canvas id="gameCanvas"></canvas>

  <script type="module">
    import * as mat4 from 'https://cdn.skypack.dev/gl-matrix/mat4';

    const canvas = document.getElementById("gameCanvas");
    const gl = canvas.getContext("webgl");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Simple shader setup
    function createShader(gl, type, source) {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      return shader;
    }

    function createProgram(gl, vertexSrc, fragmentSrc) {
      const vShader = createShader(gl, gl.VERTEX_SHADER, vertexSrc);
      const fShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentSrc);
      const program = gl.createProgram();
      gl.attachShader(program, vShader);
      gl.attachShader(program, fShader);
      gl.linkProgram(program);
      return program;
    }

    const vertexShaderSrc = `
      attribute vec3 aPosition;
      uniform mat4 uProjection;
      uniform mat4 uView;
      uniform mat4 uModel;
      void main() {
        gl_Position = uProjection * uView * uModel * vec4(aPosition, 1.0);
      }
    `;

    const fragmentShaderSrc = `
      precision mediump float;
      uniform vec3 uColor;
      void main() {
        gl_FragColor = vec4(uColor, 1.0);
      }
    `;

    const program = createProgram(gl, vertexShaderSrc, fragmentShaderSrc);
    gl.useProgram(program);

    const aPosition = gl.getAttribLocation(program, "aPosition");
    const uProjection = gl.getUniformLocation(program, "uProjection");
    const uView = gl.getUniformLocation(program, "uView");
    const uModel = gl.getUniformLocation(program, "uModel");
    const uColor = gl.getUniformLocation(program, "uColor");

    // Cube vertices
    const vertices = new Float32Array([
      -0.5,-0.5,-0.5,  0.5,-0.5,-0.5,  0.5,0.5,-0.5,  -0.5,0.5,-0.5, // back
      -0.5,-0.5,0.5,  0.5,-0.5,0.5,  0.5,0.5,0.5,  -0.5,0.5,0.5  // front
    ]);

    const indices = new Uint16Array([
      0,1,2, 2,3,0,
      4,5,6, 6,7,4,
      0,1,5, 5,4,0,
      2,3,7, 7,6,2,
      1,2,6, 6,5,1,
      3,0,4, 4,7,3
    ]);

    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    const vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aPosition);

    const ebo = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ebo);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

    // Blocks and player
    const blocks = [ { x: 0, y: 0, z: -5, type: 1 }, { x: 1, y: 0, z: -5, type: 1 } ];
    const BLOCK_TYPES = [ [0.6, 0.4, 0.2] ]; // dirt
    const player = { x: 0, y: 1.6, z: 0, yaw: 0, pitch: 0 };

    function updatePlayer() {
      // Placeholder: no movement yet
    }

    function drawBlock(x, y, z, color, projection, view) {
      const model = mat4.create();
      mat4.translate(model, model, [x, y, z]);

      gl.useProgram(program);
      gl.uniformMatrix4fv(uProjection, false, projection);
      gl.uniformMatrix4fv(uView, false, view);
      gl.uniformMatrix4fv(uModel, false, model);
      gl.uniform3fv(uColor, color);

      gl.bindVertexArray(vao);
      gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
    }

    let gameStarted = true;

    function renderLoop() {
      if (gameStarted) {
        updatePlayer();

        gl.clearColor(0.53, 0.81, 0.98, 1.0);
        gl.enable(gl.DEPTH_TEST);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        const projection = mat4.create();
        mat4.perspective(projection, 70 * Math.PI / 180, canvas.width / canvas.height, 0.1, 1000);

        const view = mat4.create();
        const radYaw = player.yaw * Math.PI / 180;
        const radPitch = player.pitch * Math.PI / 180;
        const lookX = player.x + Math.cos(radPitch) * Math.sin(radYaw);
        const lookY = player.y + Math.sin(radPitch);
        const lookZ = player.z + Math.cos(radPitch) * Math.cos(radYaw);
        mat4.lookAt(view, [player.x, player.y, player.z], [lookX, lookY, lookZ], [0, 1, 0]);

        blocks.forEach(b => {
          drawBlock(b.x, b.y, b.z, BLOCK_TYPES[b.type - 1], projection, view);
        });
      }
      requestAnimationFrame(renderLoop);
    }

    renderLoop();
  </script>
</body>
</html>
