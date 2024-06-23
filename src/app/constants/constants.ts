
export const SUBSCRIPTION_EXAMPLE = {
    "type": "l1-subscription",
    "id": "1",
    "instrumentId": "ad9e5345-4c3b-41fc-9437-1d253f62db52",
    "provider": "simulation",
    "subscribe": true,
    "kinds": [
      "ask",
      "bid",
      "last"
    ]
}

export const PROVIDERS = [
    "active-tick",
    "alpaca",
    "cryptoquote",
    "dxfeed",
    "oanda",
    "simulation"
];
