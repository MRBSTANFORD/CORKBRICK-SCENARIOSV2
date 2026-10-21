fetch("https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-schnell", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ inputs: "a cute dog" })
}).then(res => console.log(res.status)).catch(console.error);
