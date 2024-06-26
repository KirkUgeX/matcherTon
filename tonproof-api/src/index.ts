import express from "express";
import { TonProofApi } from "./TonProofApi";
import bodyParser from "body-parser";
import { Account } from '@tonconnect/sdk';

const app = express();
const port = 2000;

app.use(bodyParser.json());

app.get('/generatePayload', async (req, res) => {
    try {
        const payload = TonProofApi.generatePayload();
        res.json({ payload });
    } catch (error) {
        res.status(500).send((error as Error).message);
    }
});

app.post('/checkProof', async (req, res) => {
    const { proof_payload, wal_address } = req.body;
    console.log(proof_payload)

    try {
        const response = await TonProofApi.checkProof(proof_payload,wal_address);
        res.json({ result: response });
    } catch (error) {
        res.status(500).send((error as Error).message);
    }
});


app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
