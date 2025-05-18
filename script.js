let score = [0, 0, 0, 0, 0, 0, 0, 0, 0]
let count = 0
let questions = []
const sections = ["home", "quiz", "results"]
let answers = []
let showexplanation = false;

function toggleexplanation() {
    if (showexplanation == true) {
        showexplanation = false;
        document.getElementById("hiddentext1").style.display = "none";
        document.getElementById("hiddentext2").style.display = "none";
    } else {
        showexplanation = true;
        document.getElementById("hiddentext1").style.display = "initial";
        document.getElementById("hiddentext2").style.display = "initial";
    }
}

function show(section = "home") {
    window.scrollTo({ top: 0, behavior: "auto" })
    sections.forEach(id => {
        const el = document.getElementById(id)
        if (el) el.classList.remove("active")
    })
    const target = document.getElementById(section)
    if (target) target.classList.add("active")
    if (section === "results") drawCanvas(document.getElementById("result-canvas"))
}

function update() {
    const counter = document.getElementById("counter")
    const question = document.getElementById("question")
    if (counter && question) {
        counter.innerText = "Question " + (count + 1) + " of " + questions.length
        question.innerText = questions[count].text
    }
}

function addScore(change) {
    if (count >= questions.length) return
    answers.push(change)
    questions[count].effect.forEach((value, index) => {
        score[index] += value * change
    })
    count += 1
    if (count < questions.length) update()
    else show("results")
}

function back() {
    if (count > 0) {
        count -= 1
        const lastAnswer = answers.pop()
        questions[count].effect.forEach((value, index) => {
            score[index] -= value * lastAnswer
        })
        update()
    } else show()
}

function start() {
    show()
    count = 0
    score = [0, 0, 0, 0, 0, 0, 0, 0, 0]
    answers = []
    update()
}

function calculateMaxScores() {
    const maxScores = [0, 0, 0, 0, 0, 0, 0, 0, 0]
    questions.forEach(question => {
        question.effect.forEach((value, index) => {
            if (value > 0) maxScores[index] += value
            else if (value < 0) maxScores[index] -= value
        })
    })
    return maxScores
}

function calculatePercentages() {
    const maxScores = calculateMaxScores()
    let percentages = []
    for (let i = 0; i < 9; i++) {
        const totalScore = score[i]
        const maxPossibleScore = maxScores[i] || 1
        let percentage = (totalScore / maxPossibleScore) * 50 + 50
        percentage = Math.max(0, Math.min(100, percentage))
        percentages.push(percentage)
    }
    return percentages
}

function drawCanvas(canvas) {
    const percentages = calculatePercentages()
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = "#333"
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    const barWidth = 700
    const barHeight = 30
    const axisSpacing = 40
    const xPos = (canvas.width - barWidth) / 2
    const labelYOffset = 50
    const axisLabels = [
        "Optimistic VS Pessimistic", "Material VS Spiritual", "Purist VS Transhumanist", "Darwinist VS Idealist", "Homogenous VS Heterogenous", "Isolationist VS Expansionist", "Traditional VS Progressive", "Primitive VS Accelerationist", "Cosmic Indifference VS Anthropocentrism"
    ]
    for (let i = 0; i < 9; i++) {
        const percentage = percentages[i]
        const yPos = labelYOffset + (i * (barHeight + axisSpacing))
        ctx.fillStyle = "#ddd"
        ctx.fillRect(xPos, yPos, barWidth, barHeight)
        const leftWidth = barWidth * (percentage / 100)
        const rightWidth = barWidth - leftWidth
        ctx.fillStyle = "#FF6347"
        ctx.fillRect(xPos, yPos, leftWidth, barHeight)
        ctx.fillStyle = "#4682B4"
        ctx.fillRect(xPos + leftWidth, yPos, rightWidth, barHeight)
        ctx.fillStyle = "white"
        ctx.font = "18px Arial"
        ctx.textAlign = "center"
        ctx.fillText(axisLabels[i], xPos + barWidth / 2, yPos - 10)
        const leftPercentage = Math.round(percentage)
        const rightPercentage = Math.round(100 - percentage)
        if (leftPercentage >= 10) {
            ctx.fillStyle = "white"
            ctx.font = "16px Arial"
            ctx.textAlign = "left"
            ctx.fillText(`${leftPercentage}%`, xPos + 8, yPos + barHeight / 2 + 6)
        }
        if (rightPercentage >= 10) {
            ctx.fillStyle = "white"
            ctx.font = "16px Arial"
            ctx.textAlign = "right"
            ctx.fillText(`${rightPercentage}%`, xPos + barWidth - 8, yPos + barHeight / 2 + 6)
        }
    }
}

document.addEventListener("DOMContentLoaded", async function () {
    try {
        const questionsResponse = await fetch("./questions.json")
        questions = await questionsResponse.json()
        update()
        show()
    } catch (error) {
        console.error("Error fetching resources:", error)
    }
})

document.getElementById("download-btn")?.addEventListener("click", function () {
    const canvas = document.getElementById("result-canvas")
    const dataUrl = canvas.toDataURL("image/png")
    const a = document.createElement("a")
    a.href = dataUrl
    a.download = "Cod Merchant Test Results.png"
    a.click()
})
