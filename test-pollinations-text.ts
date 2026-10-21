fetch("https://text.pollinations.ai/write%20a%20poem").then(res => res.text()).then(text => console.log(text.substring(0, 50))).catch(console.error);
