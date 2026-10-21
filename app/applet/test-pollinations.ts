fetch("https://image.pollinations.ai/prompt/a%20cute%20dog?width=768&height=768&nologo=true").then(res => console.log(res.status, res.headers)).catch(console.error);
