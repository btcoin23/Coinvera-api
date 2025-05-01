const apiTest = async () => {
    const x_api_key = "15111b24be6f5e9d2d311ffc597641ec71f1d1d9" // Replace with your actual API key
    const tokens = "3kBEZJLh8oCFApS3vqkgun3V9ronYh1J8EKzrksT6VEb,2aziTNXVUtca823nCUx9AMAci5pB4YWYhkC13pwrpump" // Replace with your actual token addresses
    const result = await fetch(`http://localhost:5000/api/v1/price?x-api-key=${x_api_key}&tokens=${tokens}`) // Please check the port number
    const data = await result.json()
    console.log(data)
}

apiTest();