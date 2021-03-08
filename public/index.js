const textArea = document.getElementById("text-input");
const coordInput = document.getElementById("coord");
const valInput = document.getElementById("val");
const errorMsg = document.getElementById("msg");

document.addEventListener("DOMContentLoaded", () => {
  textArea.value =
    "..9..5.1.85.4....2432......1...69.83.9.....6.62.71...9......1945....4.37.4.3..6..";
  fillpuzzle(textArea.value);
});

textArea.addEventListener("input", () => {
  fillpuzzle(textArea.value);
});

coordInput.oninput = function() {
  let prev_el = document.getElementsByClassName('selected')[0]
  if (prev_el) { prev_el.className = prev_el.className.replace(/\bselected\b/g, "") }
  let sel_el = document.getElementsByClassName(this.value.toUpperCase())[0];
  if (sel_el) {
    let name, arr;
    name = "selected";
    arr = sel_el.className.split(" ");
    if (arr.indexOf(name) == -1) {
      sel_el.className += " " + name;
    }
  }
}

function fillpuzzle(data) {
  var user_input = textArea.value;
  let len = data.length < 81 ? data.length : 81;
  for (let i = 0; i < len; i++) {
    let rowLetter = String.fromCharCode('A'.charCodeAt(0) + Math.floor(i / 9));
    let col = (i % 9) + 1; 
    if (!data[i] || data[i] === ".") {
      document.getElementsByClassName(rowLetter + col)[0].innerText = " ";
      continue;
    }
    document.getElementsByClassName(rowLetter + col)[0].innerText = data[i];
    if (user_input[i] !== data[i]) {
      document.getElementsByClassName(rowLetter + col)[0].style.color = "red";
    }
  }
  return;
}

async function getSolved() {
  const init_str = {"puzzle": textArea.value}
  const data = await fetch("/api/solve", {
    method: "post",
    headers: {
      "Accept": "application/json",
      "Content-type": "application/json"
    },
    body: JSON.stringify(init_str)
  })
  const parsed = await data.json();
  if (parsed.error) {
    errorMsg.innerHTML = `<code>${JSON.stringify(parsed, null, 2)}</code>`;
    return
  }
  fillpuzzle(parsed.solution)
}

async function getChecked() {
  let element = document.getElementsByClassName("selected")[0];
  if (element) { element.className = element.className.replace(/\bselected\b/g, "") }
  const stuff = {"puzzle": textArea.value, "coordinate": coordInput.value, "value": valInput.value}
    const data = await fetch("/api/check", {
    method: "POST",
    headers: {
      "Accept": "application/json",
      "Content-type": "application/json"
    },
    body: JSON.stringify(stuff)
  })
  const parsed = await data.json();
  errorMsg.innerHTML = `<code>${JSON.stringify(parsed, null, 2)}</code>`;
}


document.getElementById("solve-button").addEventListener("click", getSolved)
document.getElementById("check-button").addEventListener("click", getChecked)