require('dotenv').config();
const express = require('express');
const { Web3 } = require('web3'); // Importación correcta

const app = express();
const PORT = process.env.PORT || 3000;

// Configurar Web3 con Infura
const web3 = new Web3(process.env.INFURA_URL);
const tokenAddress = process.env.TOKEN_ADDRESS;

// ABI mínima para leer balances
const minABI = [
    {
        "constant": true,
        "inputs": [],
        "name": "totalSupply",
        "outputs": [{ "name": "", "type": "uint256" }],
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [{ "name": "owner", "type": "address" }],
        "name": "balanceOf",
        "outputs": [{ "name": "balance", "type": "uint256" }],
        "type": "function"
    }
];

const tokenContract = new web3.eth.Contract(minABI, tokenAddress);

// Endpoint para obtener el total supply
app.get('/total-supply', async (req, res) => {
    try {
        const totalSupply = await tokenContract.methods.totalSupply().call();
        res.send(web3.utils.fromWei(totalSupply, 'ether')); // Enviar solo el número
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// Endpoint para obtener el circulating supply
app.get('/circulating-supply', async (req, res) => {
    try {
        const whaleBalance = await tokenContract.methods.balanceOf(process.env.WHALE_ADDRESS).call();
        const totalSupply = await tokenContract.methods.totalSupply().call();
        const circulatingSupply = totalSupply - whaleBalance;

        res.send(web3.utils.fromWei(circulatingSupply.toString(), 'ether')); // Enviar solo el número
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
