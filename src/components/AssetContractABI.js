export const DAI_CONTRACT = {
    BUSD: {
        address: "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56",
        abi: [
            {
                constant: true,
                inputs: [{ name: "src", type: "address" }],
                name: "balanceOf",
                outputs: [{ name: "", type: "uint256" }],
                payable: false,
                stateMutability: "view",
                type: "function",
            },
            {
                constant: false,
                inputs: [
                    { name: "dst", type: "address" },
                    { name: "wad", type: "uint256" },
                ],
                name: "transfer",
                outputs: [{ name: "", type: "bool" }],
                payable: false,
                stateMutability: "nonpayable",
                type: "function",
            },
        ],
    },
    USDC: {
        address: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d",
        abi: [
            {
                constant: true,
                inputs: [{ name: "src", type: "address" }],
                name: "balanceOf",
                outputs: [{ name: "", type: "uint256" }],
                payable: false,
                stateMutability: "view",
                type: "function",
            },
            {
                constant: false,
                inputs: [
                    { name: "dst", type: "address" },
                    { name: "wad", type: "uint256" },
                ],
                name: "transfer",
                outputs: [{ name: "", type: "bool" }],
                payable: false,
                stateMutability: "nonpayable",
                type: "function",
            },
        ],
    },
    SHIB: {
        address: "0x2859e4544C4bB03966803b044A93563Bd2D0DD4D",
        abi: [
            {
                constant: true,
                inputs: [{ name: "src", type: "address" }],
                name: "balanceOf",
                outputs: [{ name: "", type: "uint256" }],
                payable: false,
                stateMutability: "view",
                type: "function",
            },
            {
                constant: false,
                inputs: [
                    { name: "dst", type: "address" },
                    { name: "wad", type: "uint256" },
                ],
                name: "transfer",
                outputs: [{ name: "", type: "bool" }],
                payable: false,
                stateMutability: "nonpayable",
                type: "function",
            },
        ],
    },
    USDT: {
        address: "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t",
        abi: [
            {
                constant: true,
                inputs: [{ name: "src", type: "address" }],
                name: "balanceOf",
                outputs: [{ name: "", type: "uint256" }],
                payable: false,
                stateMutability: "view",
                type: "function",
            },
            {
                constant: false,
                inputs: [
                    { name: "dst", type: "address" },
                    { name: "wad", type: "uint256" },
                ],
                name: "transfer",
                outputs: [{ name: "", type: "bool" }],
                payable: false,
                stateMutability: "nonpayable",
                type: "function",
            },
        ],
    },
}