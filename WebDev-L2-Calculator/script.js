const MAX_DIGITS = 15;
const MAX_DECIMAL_PLACES = 10;

let currentInput = "0";
let previousInput = null;
let currentOperator = null;
let expression = "";
let shouldResetDisplay = false;

const expressionDisplay = document.querySelector("#display-expression");
const resultDisplay = document.querySelector("#display-result");

const numberButtons = document.querySelectorAll("[data-number]");
const operatorButtons = document.querySelectorAll("[data-operator]");
const actionButtons = document.querySelectorAll("[data-action]");

function updateDisplay() {
  expressionDisplay.textContent = expression || "0";
  resultDisplay.textContent = formatDisplayValue(currentInput);
}

function formatDisplayValue(value) {
  if (value === "Error") {
    return "Error";
  }

  if (value.endsWith(".")) {
    const numberPart = value.slice(0, -1);
    return `${formatNumber(numberPart)}.`;
  }

  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return "Error";
  }

  if (
    Math.abs(numericValue) >= 1e21 ||
    (numericValue !== 0 && Math.abs(numericValue) < 1e-6)
  ) {
    return formatScientificNumber(numericValue);
  }

  return formatNumber(value);
}

function formatNumber(value) {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return "Error";
  }

  const roundedValue = Number(numericValue.toFixed(MAX_DECIMAL_PLACES));

  return roundedValue.toLocaleString("en-US", {
    maximumFractionDigits: MAX_DECIMAL_PLACES,
  });
}

function formatScientificNumber(number) {
  const [coefficient, exponent] = number.toExponential(8).split("e");

  const formattedCoefficient = Number(coefficient).toLocaleString("en-US", {
    maximumFractionDigits: 8,
  });

  const formattedExponent = Number(exponent);

  return `${formattedCoefficient}e${
    formattedExponent >= 0 ? "+" : ""
  }${formattedExponent}`;
}

function inputNumber(number) {
  if (shouldResetDisplay) {
    currentInput = "0";
    shouldResetDisplay = false;
  }

  const digitCount = currentInput.replace(/\D/g, "").length;

  if (digitCount >= MAX_DIGITS) {
    return;
  }

  if (currentInput === "0") {
    currentInput = number;
  } else {
    currentInput += number;
  }

  updateDisplay();
}

function inputDecimal() {
  if (shouldResetDisplay) {
    currentInput = "0";
    shouldResetDisplay = false;
  }

  if (currentInput.includes(".")) {
    return;
  }

  currentInput += ".";

  updateDisplay();
}

function handleOperator(operator) {
  if (currentInput === "Error") {
    return;
  }

  if (shouldResetDisplay && previousInput !== null) {
    currentOperator = operator;
    expression = `${formatNumber(previousInput)} ${getOperatorSymbol(operator)}`;

    updateDisplay();
    return;
  }

  if (currentOperator && previousInput !== null) {
    const result = calculate(
      Number(previousInput),
      currentOperator,
      Number(currentInput),
    );

    if (result === null) {
      showError();
      return;
    }

    currentInput = String(result);
    previousInput = currentInput;
  } else {
    previousInput = currentInput;
  }

  currentOperator = operator;

  expression = `${formatNumber(previousInput)} ${getOperatorSymbol(operator)}`;

  shouldResetDisplay = true;

  updateDisplay();
}

function calculate(firstNumber, operator, secondNumber) {
  let result;

  switch (operator) {
    case "+":
      result = firstNumber + secondNumber;
      break;

    case "-":
      result = firstNumber - secondNumber;
      break;

    case "*":
      result = firstNumber * secondNumber;
      break;

    case "/":
      if (secondNumber === 0) {
        return null;
      }

      result = firstNumber / secondNumber;
      break;

    default:
      return secondNumber;
  }

  if (!Number.isFinite(result)) {
    return null;
  }

  return Number(result.toFixed(MAX_DECIMAL_PLACES));
}

function handleEquals() {
  if (
    currentOperator === null ||
    previousInput === null ||
    currentInput === "Error"
  ) {
    return;
  }

  const firstNumber = Number(previousInput);
  const secondNumber = Number(currentInput);

  const result = calculate(firstNumber, currentOperator, secondNumber);

  if (result === null) {
    showError();
    return;
  }

  expression =
    `${formatNumber(firstNumber)} ` +
    `${getOperatorSymbol(currentOperator)} ` +
    `${formatNumber(secondNumber)} =`;

  currentInput = String(result);
  previousInput = null;
  currentOperator = null;
  shouldResetDisplay = true;

  updateDisplay();
}

function handleClear() {
  currentInput = "0";
  previousInput = null;
  currentOperator = null;
  expression = "";
  shouldResetDisplay = false;

  updateDisplay();
}

function handleBackspace() {
  if (currentInput === "Error") {
    return;
  }

  if (shouldResetDisplay) {
    shouldResetDisplay = false;
  }

  if (currentInput.length <= 1) {
    currentInput = "0";
  } else {
    currentInput = currentInput.slice(0, -1);
  }

  updateDisplay();
}

function showError() {
  currentInput = "Error";
  expression = "Cannot divide by zero";
  previousInput = null;
  currentOperator = null;
  shouldResetDisplay = true;

  updateDisplay();
}

function getOperatorSymbol(operator) {
  const symbols = {
    "+": "+",
    "-": "−",
    "*": "×",
    "/": "÷",
  };

  return symbols[operator] || operator;
}

numberButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const value = button.dataset.number;

    if (value === ".") {
      inputDecimal();
    } else {
      inputNumber(value);
    }
  });
});

operatorButtons.forEach((button) => {
  button.addEventListener("click", () => {
    handleOperator(button.dataset.operator);
  });
});

actionButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const action = button.dataset.action;

    switch (action) {
      case "clear":
        handleClear();
        break;

      case "backspace":
        handleBackspace();
        break;

      case "equals":
        handleEquals();
        break;
    }
  });
});

document.addEventListener("keydown", (event) => {
  const key = event.key;

  if (/^\d$/.test(key)) {
    inputNumber(key);
    return;
  }

  if (key === ".") {
    inputDecimal();
    return;
  }

  if (["+", "-", "*", "/"].includes(key)) {
    handleOperator(key);
    return;
  }

  if (key === "Enter" || key === "=") {
    event.preventDefault();
    handleEquals();
    return;
  }

  if (key === "Escape") {
    handleClear();
    return;
  }

  if (key === "Backspace") {
    handleBackspace();
  }
});

updateDisplay();
