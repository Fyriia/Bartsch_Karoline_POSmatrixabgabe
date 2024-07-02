

let originalMatrix = {
  values: [],
  nodes: [],
  nodeCounter: 1

}

//variables
const $uploadInput = document.getElementById('upload-input');
const $outputDiv = document.getElementById('output');
const $canvas = document.getElementById('graph-canvas');
const context = $canvas.getContext('2d');
let currentlyDrawing = false;
let originIndex = false;
const $matrizenButton = document.getElementById('matrizenButton');
const $matrizenDiv = document.getElementById('matrizen');


//event listeners
$uploadInput.addEventListener('change', acceptFile);
$canvas.addEventListener('click', (event) => handleCanvasClick(event));
$matrizenButton.addEventListener('click', () => { document.getElementById('matrizen').classList.toggle('hidden')});

function isItOnANode(event){
  const rect = $canvas.getBoundingClientRect();
  const mouseX = event.clientX - rect.left;
  const mouseY = event.clientY - rect.top;
  let index = false;
  for (let i = 0; i < originalMatrix.nodes.length; i++) {
    if ((mouseX <= originalMatrix.nodes[i].x + 19 && mouseX >= originalMatrix.nodes[i].x - 19) &&
      (mouseY <= originalMatrix.nodes[i].y + 19 && mouseY >= originalMatrix.nodes[i].y - 19)) {
      index = i;

    }
}
  return index;
}

function handleCanvasClick(event) {

  if (isItOnANode(event) !== false && !currentlyDrawing) {
    addEdge(event);
  } else if (currentlyDrawing && isItOnANode(event) !== false) {
    continueEdge(event);
  } else {
    addNode(event);
  }
}

function addNode(event){
  const rect = $canvas.getBoundingClientRect();
  const mouseX = event.clientX - rect.left;
  const mouseY = event.clientY - rect.top;

  for (const element of originalMatrix.values) {
    element.push(0);
  }
  let newNode = [];
  for (let i = 0; i < originalMatrix.values.length+1; i++) {
    newNode.push(0);
  }
  originalMatrix.values.push(newNode);
  originalMatrix.nodes.push({label: originalMatrix.nodeCounter++, x: mouseX, y: mouseY});
  translateMatrix(originalMatrix);
}
function addEdge(event) {
  currentlyDrawing = true;
  originIndex = isItOnANode(event);
  context.beginPath();
  context.arc(originalMatrix.nodes[originIndex].x, originalMatrix.nodes[originIndex].y, 16, 0, Math.PI * 2, true);
  context.fillStyle = '#ED5CF3';
  context.fill();
  context.stroke();
  context.fillStyle = 'white';
  context.font = '14px Arial';
  context.fillText(toLetters(originalMatrix.nodes[originIndex].label), originalMatrix.nodes[originIndex].x - 5, originalMatrix.nodes[originIndex].y + 5);
}

function continueEdge(event) {
  let destinationIndex = false;
  if (currentlyDrawing && originIndex !== false) {
    destinationIndex = isItOnANode(event);
    }
    if (destinationIndex !== false) {
      originalMatrix.values[originIndex][destinationIndex] = 1;
      originalMatrix.values[destinationIndex][originIndex] = 1;
      translateMatrix(originalMatrix);
    }
  currentlyDrawing = false;
  originIndex = false;
}

function calcEverything(m){
  $outputDiv.innerHTML = '';
  $matrizenDiv.innerHTML = '';
  eccentricityCalc(m);
  calcComponents(m);
  calcArticulations(m);
  calcBridges(m);
  displayMatrix(originalMatrix);
  displayMatrix(calculateDistances(originalMatrix));

}

function acceptFile(e){
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = function (event) {
      const content = event.target.result;
      refresh();
      translateMatrix(createNodes(matrixArray(content)));
    }
    reader.readAsText(file);
}

function refresh(){
  originalMatrix = {
    values: [],
    nodes: [],
    nodeCounter: 1
  };
  $outputDiv.innerHTML = '';
  $matrizenDiv.innerHTML = '';
}

function matrixArray(content) {
  const lines = content.trim().split('\n');

  const numColumns = lines[0].split(';').length;
  const columns = Array.from({length: numColumns}, () => []);

  lines.forEach(line => {
    const values = line.trim().split(';');
    values.forEach((value, index) => {
      columns[index].push(parseInt(value));
    });
  });
  for (let i = 0; i < columns.length; i++) {
    originalMatrix.values[i] = columns[i];
  }
return originalMatrix;
}
function displayMatrix(matrix) {
  if (!matrix || !matrix.values || matrix.values.length === 0 || !matrix.values[0]) {
    throw Error;
  }

  const table = document.createElement('table');

  matrix.values.forEach(rowValues => {
    const row = document.createElement('tr');
    rowValues.forEach(cellValue => {
      const cell = document.createElement('td');
      cell.textContent = cellValue + ';';
      row.appendChild(cell);
    });
    table.appendChild(row);
  });
  document.getElementById('matrizen').appendChild(table);
}


//Funktion übernommen von StackOverflow
function toLetters(num) {
  "use strict";
  let mod = num % 26,
    pow = num / 26 | 0,
    out = mod ? String.fromCharCode(64 + mod) : (--pow, 'Z');
  return pow ? toLetters(pow) + out : out;
}
function add(m1, m2){
  if (m1 === null || m2 === null || m1 === undefined || m2 === undefined){
    throw Error;
  }
  let m3 = {
    values: []
  };
  for (let i = 0; i < m1.values.length; i++) {
    let result = [];
    for (let j = 0; j < m1.values[i].length; j++) {
      result.push((m1.values[i][j] + m2.values[i][j]));
    }
    m3.values.push(result);
  }
  return m3;
}


  function multiply(m1, m2) {
    if (m1 === null || m2 === null || m1 === undefined || m2 === undefined) {
      throw Error;
    }

    const columns = m1.values.length;
    const rows = m1.values[0].length;

    let m3 = {
      values: []
    };

    for (let i = 0; i < columns; i++) {
      m3.values[i] = [];
      for (let j = 0; j < rows; j++) {
        let sum = 0;
        for (let k = 0; k < rows; k++) {
          sum += m1.values[i][k] * m2.values[k][j];
        }
        m3.values[i][j] = sum;
      }
    }
    return m3;
  }

  function initializeDistanzmatrix(m1){
    let distanzmatrix = {
      values: []
    };

    for (let i = 0; i < m1.values.length; i++) {
      distanzmatrix.values[i] = [...m1.values[i]];
    }
    for (let i = 0; i < distanzmatrix.values.length; i++) {
       distanzmatrix.values[i][i] =' . ';
    }
    for (const element of distanzmatrix.values) {
      for (let j = 0; j < element.length; j++) {
        if (element[j] === 0) {
          element[j] = '∞';
        }
      }
    }
    for (let i = 0; i < distanzmatrix.values.length; i++) {
      distanzmatrix.values[i][i] = 0;
    }
    return distanzmatrix;

}

function calculateDistances(m1) {
  let distanzmatrix = initializeDistanzmatrix(m1);
  let prevResult = m1;
  for (let i = 2; i <= m1.values.length+1; i++) {
    let currentResult = multiply(m1, prevResult);
    prevResult = currentResult;

    for (let j = 0; j < distanzmatrix.values.length; j++) {
      for (let k = 0; k < distanzmatrix.values[j].length; k++) {
        if (distanzmatrix.values[j][k] === '∞' && currentResult.values[j][k] !== 0){
          distanzmatrix.values[j][k] = i;
        }
      }
    }

  }
  return distanzmatrix;
}

function eccentricityCalc(m1){
  let newMatrix = calculateDistances(m1);
  let eccentricities = [];
  for (const element of newMatrix.values) {
    for (let j = 0; j < element.length; j++) {
      if (element[j] === '∞'){
        const p = document.createElement('p');
        p.textContent = `Graph ist nicht zusammenhängend.`;
        $outputDiv.appendChild(p);
        return;
      }
    }}

  for (let i = 0; i < newMatrix.values.length; i++) {
    let counter = 0;
    for (let j = 0; j < newMatrix.values[i].length; j++) {
      if (newMatrix.values[i][j] > counter){
        counter = newMatrix.values[i][j];
        eccentricities[i] = ([j, newMatrix.values[i][j]]);
      }
    }


  }
m1.eccentricities = eccentricities;
  let durchmesser = 0;
  let radius = 1000000000000;
  let zentrum = "";

  for (let i = 0; i < eccentricities.length; i++) {
    if (eccentricities[i][1] > durchmesser){
      durchmesser = eccentricities[i][1];
    }
    if (eccentricities[i][1] < radius) {
      radius = eccentricities[i][1];
    }
  }
  for (let i = 0; i < eccentricities.length; i++) {
    if (eccentricities[i][1] === radius){
      if (zentrum.length > 0){
        zentrum += ', ';
      }
      zentrum += toLetters(i+1);
    }
  }
  const p2 = document.createElement('p')
  p2.innerHTML = `Der Durchmesser dieses Graphs beträgt <strong>${durchmesser}</strong>, der Radius beträgt <strong>${radius}</strong> und das Zentrum/die Zentren ist/sind <strong>${zentrum}</strong>.`
  if (radius === 1000000000000){
    p2.textContent = 'Graph ist nicht zusammenhängend.'
  }

  $outputDiv.appendChild(p2);
}

function initializeWegmatrix(m){
  if (m == null) {
    throw new Error("Übergebene Matrix ist null.");
  }
  let wegmatrix = {
    values: []
  };

    let numColumns = m.values.length;
    for (let i = 0; i < numColumns; i++) {
      let column = [];
      for (let j = 0; j < numColumns; j++) {
        if (j === i ) {
          column.push(1);
        } else {
          column.push(0);
        }
      }
      wegmatrix.values.push(column);
    }

  for (let i = 0; i < m.values.length; i++) {
    for (let j = 0; j < m.values[i].length; j++) {
      if (m.values[i][j] > 0){
        wegmatrix.values[i][j] = 1;
      }
    }
  }

  let prevResult = JSON.parse(JSON.stringify(m));
  for (let i = 2; i <= m.values.length+1; i++) {
    let currentResult = multiply(m, prevResult);
    prevResult = currentResult;

    for (let j = 0; j < wegmatrix.values.length; j++) {
      for (let k = 0; k < wegmatrix.values[j].length; k++) {
        if (wegmatrix.values[j][k] === 0 && currentResult.values[j][k] > 0){
          wegmatrix.values[j][k] = 1;
        }
      }
    }

  }
  return wegmatrix;
}

function calcComponents(m){
  let wegmatrix = initializeWegmatrix(m);
  let uniqueRows = new Set;
  for (let i = 0; i < wegmatrix.values.length; i++) {
    uniqueRows.add(JSON.stringify(wegmatrix.values[i]));
  }
  return uniqueRows.size;
}

function calcArticulations(m){
  let baseCount = calcComponents(m);
  let articulations = [];

  for (let i = 0; i < m.values.length; i++) {
    let mCopy = JSON.parse(JSON.stringify(m));

    let removedRow = mCopy.values.splice(i, 1);

    let removedColumn = [];
    for (let j = 0; j < mCopy.values.length; j++) {
      removedColumn.push(mCopy.values[j].splice(i, 1));
    }

    if (calcComponents(mCopy) > baseCount) {
      articulations.push(toLetters(i + 1));
    }

    /*mCopy.values.splice(i, 0, removedRow);
    for (let j = 0; j < mCopy.values.length; j++) {
      mCopy.values[j].splice(i, 0, removedColumn[j]);
    }*/

  }
  const p = document.createElement('p');
  p.innerHTML = `Die Artikulation/en in diesem Graphen ist/sind <strong>${articulations}</strong>.`;
  if (articulations.length === 0){
    p.textContent = 'Dieser Graph enthält keine Artikulationen.'
  }
  $outputDiv.appendChild(p);

  return articulations;
}

function calcBridges(m){
  let baseCount = calcComponents(m);
  let mCopy = JSON.parse(JSON.stringify(m));
  let bridges = [];
  for (let i = 0; i < mCopy.values.length; i++) {
    for (let j = i+1; j < mCopy.values[i].length; j++) {
      if (mCopy.values[i][j] === 1){
        mCopy.values[i][j] = 0;
        mCopy.values[j][i] = 0;
        if (calcComponents(mCopy) > baseCount){
          let string = ' ' + toLetters(i+1) + ' und '+ toLetters(j+1);
          bridges.push(string);
        }
        mCopy.values[i][j] = 1;
        mCopy.values[j][i] = 1;
      }

    }
  }
  const p = document.createElement('p');
  p.innerHTML = `Die Brücke/n in diesem Graphen ist/sind zwischen <strong>${bridges}</strong>.`;

  if (bridges.length === 0){
    p.textContent = 'Dieser Graph enthält keine Brücken.'
  }
  $outputDiv.appendChild(p);
  console.log(bridges);
  return bridges;
}

function getRandom(min, max) {
  return Math.random() * (max - min) + min;
}

function createNodes(m){
  m.nodeCounter = 1;
  const nodes = [];
  for (let i = 1; i <= m.values.length; i++) {
    let node = {label: m.nodeCounter++, x: getRandom(-$canvas.width/2.5, $canvas.width/2.5) + $canvas.width / 2, y: getRandom(-$canvas.height/2.5, $canvas.height/2.5) + $canvas.height/2};
    nodes.push(node);
  }

  m.nodes = nodes;
  for (let i = 0; i < 100; i++) {
    updateNodePositions(m);
  }

  return m;
}

  function updateNodePositions(m) {
    for (let i = 0; i < m.nodes.length; i++) {
      for (let j = 0; j < m.nodes.length; j++) {
        if (Math.abs(m.nodes[i].x - m.nodes[j].x) < 19 && Math.abs(m.nodes[i].y - m.nodes[j].y) < 19){
          m.nodes[i].x = getRandom(-$canvas.width/2.3, $canvas.width/2.3) + $canvas.width / 2;
          m.nodes[i].y = getRandom(-$canvas.height/2.5, $canvas.height/2.5) + $canvas.height/2;
        }
      }
    }

  }

function translateMatrix(m){
  $outputDiv.innerHTML = '';
  context.clearRect(0, 0, $canvas.width, $canvas.height);
  context.strokeStyle = '#424FD2'

  for (let i = 0; i < m.values.length; i++) {
    for (let j = i + 1; j < m.values[i].length; j++) {
      if (m.values[i][j] === 1) {
        context.beginPath();
        context.moveTo(m.nodes[i].x, m.nodes[i].y);
        context.lineTo(m.nodes[j].x, m.nodes[j].y);
        context.stroke();
      }
    }
  }

  m.nodes.forEach(node => {
    context.beginPath();
    context.arc(node.x, node.y, 16, 0, Math.PI * 2, true);
    context.fillStyle = '#424FD2';
    context.fill();
    context.stroke();
    context.fillStyle = 'white';
    context.font = '14px Arial';
    context.fillText(toLetters(node.label), node.x - 5, node.y + 5);
  });
  calcEverything(m);
}

