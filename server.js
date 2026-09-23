const dotenv = require("dotenv")
dotenv.config();
const express = require('express');
const cors = require('cors');

const app = express();


// Middleware
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;


// Home route
app.get('/', (req, res) => {
    res.send('Number Classification API is running');
});


// Check if number is prime
function isPrime(number) {
    if (number < 2) {
        return false;
    }

    for (let i = 2; i <= Math.sqrt(number); i++) {
        if (number % i === 0) {
            return false;
        }
    }

    return true;
}


// Check if number is perfect
function isPerfect(number) {
    if (number < 2) {
        return false;
    }

    let sum = 1;

    for (let i = 2; i <= Math.sqrt(number); i++) {
        if (number % i === 0) {
            sum += i;

            if (i !== number / i) {
                sum += number / i;
            }
        }
    }

    return sum === number;
}


// Check if number is Armstrong
function isArmstrong(number) {
    if (number < 0) {
        return false;
    }

    const digits = number.toString().split('');
    const power = digits.length;

    let sum = 0;

    for (let digit of digits) {
        sum += Math.pow(Number(digit), power);
    }

    return sum === number;
}


// Calculate digit sum
function digitSum(number) {
    return Math.abs(number)
        .toString()
        .split('')
        .reduce((sum, digit) => sum + Number(digit), 0);
}


// Classify number
app.get('/api/classify-number', async (req, res) => {
    try {

        const number = Number(req.query.number);


        // Validate input
        if (!Number.isInteger(number)) {
            return res.status(400).json({
                number: req.query.number,
                error: true
            });
        }


        // Get fun fact from Numbers API
        let funFact;

        try {

            const response = await fetch(
                `https://numbersapi.com/${number}/math?json`
            );

            if (response.ok) {

                const data = await response.json();

                funFact = data.text;

            }

        } catch (error) {

            // Numbers API failed
            funFact = null;

        }


        // Fallback fun fact
        if (!funFact) {

            if (isArmstrong(number)) {

                const digits = number.toString().split('');
                const power = digits.length;

                const calculation = digits
                    .map(digit => `${digit}^${power}`)
                    .join(' + ');

                funFact = `${number} is an Armstrong number because ${calculation} = ${number}`;

            } else if (isPerfect(number)) {

                funFact = `${number} is a perfect number.`;

            } else if (isPrime(number)) {

                funFact = `${number} is a prime number.`;

            } else {

                funFact = `${number} is an ${number % 2 === 0 ? 'even' : 'odd'} number.`;
            }
        }


        // Send response
        res.status(200).json({

            number: number,

            is_prime: isPrime(number),

            is_perfect: isPerfect(number),

            properties: [
                ...(isArmstrong(number) ? ['armstrong'] : []),
                ...(number % 2 === 0 ? ['even'] : ['odd'])
            ],

            digit_sum: digitSum(number),

            fun_fact: funFact
        });

    } catch (error) {

        return res.status(500).json({
            error: error.message
        });

    }
});


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});