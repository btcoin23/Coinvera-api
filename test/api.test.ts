// Single request with url-api-key
const test_1 = async () => {
    const x_api_key = "15111b24be6f5e9d2d311ffc597641ec71f1d1d9" // Replace with your actual API key
    const ca = "3kBEZJLh8oCFApS3vqkgun3V9ronYh1J8EKzrksT6VEb" // Replace with your actual token addresses
    const result = await fetch(`http://localhost:5000/api/v1/price?x-api-key=${x_api_key}&ca=${ca}`) // Please check the port number
    const data = await result.json()
    console.log(data)
}

// Single request with header-api-key
const test_2 = async () => {
    const x_api_key = "15111b24be6f5e9d2d311ffc597641ec71f1d1d9" // Replace with your actual API key
    const ca = "3kBEZJLh8oCFApS3vqkgun3V9ronYh1J8EKzrksT6VEb" // Replace with your actual token addresses
    const result = await fetch(`http://localhost:5000/api/v1/price?ca=${ca}`, {
        headers: {
            "Content-Type": "application/json",
            "x-api-key": x_api_key,
        }
    }) // Please check the port number
    const data = await result.json()
    console.log(data)
}

// Batch request with url-api-key
const test_3 = async () => {
    const x_api_key = "15111b24be6f5e9d2d311ffc597641ec71f1d1d9" // Replace with your actual API key
    const tokens = "3kBEZJLh8oCFApS3vqkgun3V9ronYh1J8EKzrksT6VEb,2aziTNXVUtca823nCUx9AMAci5pB4YWYhkC13pwrpump" // Replace with your actual token addresses
    const result = await fetch(`http://localhost:5000/api/v1/price?x-api-key=${x_api_key}&tokens=${tokens}`) // Please check the port number
    const data = await result.json()
    console.log(data)
}

// Batch request with header-api-key
const test_4 = async () => {
    const x_api_key = "15111b24be6f5e9d2d311ffc597641ec71f1d1d9" // Replace with your actual API key
    const tokens = "3kBEZJLh8oCFApS3vqkgun3V9ronYh1J8EKzrksT6VEb,2aziTNXVUtca823nCUx9AMAci5pB4YWYhkC13pwrpump" // Replace with your actual token addresses
    const result = await fetch(`http://localhost:5000/api/v1/price?tokens=${tokens}`, {
        headers: {
            'content-type': 'application/json',
            'x-api-key': x_api_key
        }
    })
    const data = await result.json()
    console.log(data)
}

test_1();
// test_2();
// test_3();
// test_4();