document.addEventListener("DOMContentLoaded", async function () {
  document
    .getElementById("otp-send")
    .addEventListener("submit", async function (event) {
      event.preventDefault();
      const inp1 = document.getElementById("input1").value;
      const inp2 = document.getElementById("input2").value;
      const inp3 = document.getElementById("input3").value;
      const inp4 = document.getElementById("input4").value;

      console.log(inp1 + inp2 + inp3 + inp4);

      var data = {
        email: localStorage.getItem("user"),
        otp: inp1 + inp2 + inp3 + inp4,
      };

      let res;

      // Make API request
      await fetch("https://sevenambola.onrender.com/users/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": localStorage.getItem("token"),
        },
        body: JSON.stringify(data),
      })
        .then(async function (response) {
          if (response.ok) {
            localStorage.clear();
            res = await response.json();
            console.log(res);
            localStorage.clear();
            window.location.href = "login.html";
          }
          res = await response.json();
          console.log(localStorage.getItem("user"));
          console.log(res);
        })
        .catch(function (error) {
          console.log("Error posting data:", error);
        });
    });
});
