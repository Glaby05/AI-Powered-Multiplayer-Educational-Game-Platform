using UnityEngine;
using UnityEngine.UI;

public class QuizManager : MonoBehaviour
{
    public Text questionText;
    public Button[] answerButtons;
    public Text timerText;
    public Text scoreText;
    public Button nextButton;

    private int score = 0;
    private float timeLeft = 30f; // Example 30 seconds per question

    void Start()
    {
        ShowQuestion("What is 2 + 2?", new string[] { "3", "4", "5", "6" }, 1);
        nextButton.onClick.AddListener(OnNextQuestion);
        UpdateScore();
    }

    void Update()
    {
        if (timeLeft > 0)
        {
            timeLeft -= Time.deltaTime;
            timerText.text = "Time: " + Mathf.Ceil(timeLeft);
        }
    }

    void ShowQuestion(string question, string[] answers, int correctIndex)
    {
        questionText.text = question;
        for (int i = 0; i < answerButtons.Length; i++)
        {
            int idx = i;
            answerButtons[i].GetComponentInChildren<Text>().text = answers[i];
            answerButtons[i].onClick.RemoveAllListeners();
            answerButtons[i].onClick.AddListener(() => OnAnswerSelected(idx == correctIndex));
        }
    }

    void OnAnswerSelected(bool isCorrect)
    {
        if (isCorrect) score += 10;
        UpdateScore();
        // Optionally, disable buttons until next question
        foreach (var btn in answerButtons) btn.interactable = false;
    }

    void OnNextQuestion()
    {
        // Load next question (implement yourself or fetch from backend)
        // For demonstration, just reset timer and buttons
        timeLeft = 30f;
        foreach (var btn in answerButtons) btn.interactable = true;
        // Show next question here...
    }

    void UpdateScore()
    {
        scoreText.text = "Score: " + score;
    }
}
