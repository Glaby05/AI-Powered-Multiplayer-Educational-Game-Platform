using UnityEngine;
using UnityEngine.UI;
using UnityEngine.Networking;
using System.Collections;

public class LoginManager : MonoBehaviour
{
    public InputField usernameInput;
    public InputField passwordInput;
    public Button loginButton;
    public Button registerButton;
    public Text statusText;

    // Your backend login endpoint
    [Header("Set your backend login URL here")]
    public string loginUrl = "https://backend-url.com/login";

    void Start()
    {
        loginButton.onClick.AddListener(() => StartCoroutine(Login()));
        registerButton.onClick.AddListener(() => StartCoroutine(Register()));
        statusText.text = "";
    }

    IEnumerator Login()
    {
        statusText.text = "Logging in...";
        var payload = JsonUtility.ToJson(new UserData(usernameInput.text, passwordInput.text));
        UnityWebRequest req = new UnityWebRequest(loginUrl, "POST");
        req.uploadHandler = new UploadHandlerRaw(System.Text.Encoding.UTF8.GetBytes(payload));
        req.downloadHandler = new DownloadHandlerBuffer();
        req.SetRequestHeader("Content-Type", "application/json");
        yield return req.SendWebRequest();

        if (req.result != UnityWebRequest.Result.Success)
        {
            statusText.text = "Login failed: " + req.error;
        }
        else
        {
            // On success, load Lobby scene
            statusText.text = "Login successful!";
            UnityEngine.SceneManagement.SceneManager.LoadScene("LobbyScene");
        }
    }

    IEnumerator Register()
    {
        // Similar to Login, but use your /register endpoint
        yield return null; // Implement registration logic
    }

    [System.Serializable]
    public class UserData
    {
        public string username;
        public string password;
        public UserData(string u, string p) { username = u; password = p; }
    }
}