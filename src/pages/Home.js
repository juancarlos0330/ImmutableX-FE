import { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { ImmutableXClient, Link, ERC721TokenType, ETHTokenType } from '@imtbl/imx-sdk';
// @mui
import { styled } from '@mui/material/styles';
import { Button, TextField, FormControl, Stack, Typography, Container, Box, Grid } from '@mui/material';
import Iconify from '../components/Iconify';
// components
import Page from '../components/Page';
import PopupDialog from '../components/PopupDialog';

// const linkAddress = 'https://link.x.immutable.com';
// const apiAddress = 'https://api.x.immutable.com/v1';
// Goerli Testnet
const linkAddress = 'https://link.sandbox.x.immutable.com';
const apiAddress = 'https://api.sandbox.x.immutable.com/v1';
const WALLET_ADDRESS = 'WALLET_ADDRESS';
const STARK_PUBLIC_KEY = 'STARK_PUBLIC_KEY';
const COLLECTION_ADDRESS = '0xacb3c6a43d15b907e8433077b6d38ae40936fe2c';

// Link SDK
const link = new Link(linkAddress);

// // IMX Client
// const client = (async () => {
//   await ImmutableXClient.build({ publicApiUrl: apiAddress });
// })();

export default function Home() {
  const [popupOpen, setPopupOpen] = useState(false);
  const [popupButtons, setPopupButtons] = useState([]);
  const [waddress, setWaddress] = useState('');
  const [balance, setBalance] = useState('');
  const [client, setClient] = useState(null);

  const [apiType, setApiType] = useState('');
  const [apiResult, setApiResult] = useState('');

  useEffect(() => {
    (async () => {
      const _client = await ImmutableXClient.build({ publicApiUrl: apiAddress });
      setClient(_client);
    })();
  }, []);

  const getUserAssets = async (assetCursor) => {
    const address = localStorage.getItem(WALLET_ADDRESS);
    const assetsRequest = await client.getAssets({
      user: address,
      cursor: assetCursor,
      status: 'imx',
      collection: COLLECTION_ADDRESS,
    });
    return { assets: assetsRequest.result, cursor: assetsRequest.cursor };
  };

  const checkValidity = (arrDomIds) => {
    if (arrDomIds === undefined || arrDomIds === null || arrDomIds.length < 1) return false;
    for (let i = 0; i < arrDomIds.length; i += 1) {
      const domObj = document.getElementById(arrDomIds[i]);
      const value = domObj.value;
      if (value.trim() === '' || (domObj.type === 'number' && value <= 0)) {
        alert('You must input this field');
        domObj.focus();
        return false;
      }
    }
    return true;
  };

  const handleConnectWalletClick = async () => {
    if (waddress === '') {
      const { address, starkPublicKey } = await link.setup({});
      localStorage.setItem(WALLET_ADDRESS, address);
      localStorage.setItem(STARK_PUBLIC_KEY, starkPublicKey);
      setWaddress(address);

      const balance = await client.getBalances({ user: address });
      console.log(balance);
      setBalance(balance.imx._hex);

      // const res = await getUserAssets(
      //   'eyJfIjoiIiwic3ltYm9sIjoiRVRIIiwiY29udHJhY3RfYWRkcmVzcyI6IiIsImlteCI6IjAiLCJwcmVwYXJpbmdfd2l0aGRyYXdhbCI6IjAiLCJ3aXRoZHJhd2FibGUiOiIwIn0'
      // );
      // console.log(res);
    } else {
      setWaddress('');
      setBalance('');
    }
  };

  const handleSellClick = async () => {
    if (!checkValidity(['sell-amount', 'sell-token-id', 'sell-token-addr'])) return false;
    if (waddress === '') {
      await handleConnectWalletClick();
    }
    try {
      const _amount = document.getElementById('sell-amount').value;
      const _tokenId = document.getElementById('sell-token-id').value;
      const _tokenAddr = document.getElementById('sell-token-addr').value;
      const sellParams = {
        amount: _amount,
        tokenId: _tokenId,
        tokenAddress: _tokenAddr,
      };

      // Throws an error if not successful
      const result = await link.sell(sellParams);

      setApiResult(`${JSON.stringify(result)}`);
    } catch (e) {
      console.log(e);
      setApiResult(`${JSON.stringify(e)}`);
    }
  };

  const handleTransferClick = async () => {
    if (!checkValidity(['token-id', 'token-addr', 'to-address'])) return false;
    if (waddress === '') {
      await handleConnectWalletClick();
    }
    try {
      const _tokenId = document.getElementById('token-id').value;
      const _tokenAddr = document.getElementById('token-addr').value;
      const _toAddr = document.getElementById('to-address').value;

      // Throws an error if not successful
      const result = await link.sell({
        type: ERC721TokenType.ERC721,
        tokenId: _tokenId,
        tokenAddress: _tokenAddr,
        to: _toAddr,
      });

      setApiResult(`${JSON.stringify(result)}`);
    } catch (e) {
      setApiResult(`${JSON.stringify(e)}`);
    }
  };

  const handleDepositClick = async () => {
    if (!checkValidity(['deposit-amount'])) return false;
    if (waddress === '') {
      await handleConnectWalletClick();
    }
    try {
      const _amount = document.getElementById('deposit-amount').value;
      const result = await link.deposit({
        type: ETHTokenType.ETH,
        amount: _amount,
      });

      setApiResult(`${JSON.stringify(result)}`);
    } catch (e) {
      setApiResult(`${JSON.stringify(e)}`);
    }
  };

  const handleWithdrawalClick = async () => {
    if (!checkValidity(['withdrawal-amount'])) return false;
    if (waddress === '') {
      await handleConnectWalletClick();
    }
    try {
      const _amount = document.getElementById('withdrawal-amount').value;
      await link.prepareWithdrawal({
        type: ETHTokenType.ETH,
        amount: _amount,
      });

      const result = await link.completeWithdrawal({
        type: ETHTokenType.ETH,
      });

      setApiResult(`${JSON.stringify(result)}`);
    } catch (e) {
      setApiResult(`${JSON.stringify(e)}`);
    }
  };

  const handleOrderListClick = async () => {
    try {
      const ordersRequest = await client.getOrders({
        status: 'active',
        sell_token_address: COLLECTION_ADDRESS,
        order_by: 'buy_quantity',
        direction: 'asc',
      });

      setApiResult(`${JSON.stringify(ordersRequest, null, 2)}`);
    } catch (e) {
      console.log(e);
      setApiResult(`${JSON.stringify(e)}`);
    }
  };

  const handleBuyClick = async () => {
    if (!checkValidity(['order-id'])) return false;
    if (waddress === '') {
      await handleConnectWalletClick();
    }
    try {
      const _orderId = document.getElementById('order-id').value;
      const result = await link.buy({ orderId: _orderId });

      setApiResult(`${JSON.stringify(result)}`);
    } catch (e) {
      console.log(e);
      setApiResult(`${JSON.stringify(e)}`);
    }
  };

  const handleMintClick = async () => {
    if (!checkValidity(['contract-addr', 'recipient', 'user-etherKey'])) return false;
    if (waddress === '') {
      await handleConnectWalletClick();
    }
    try {
      const _caddr = document.getElementById('contract-addr').value;
      const _recipient = document.getElementById('recipient').value;
      const _uethKey = document.getElementById('user-etherKey').value;
      const result = await client.mintV2([
        {
          contractAddress: _caddr,
          royalties: [
            // global fees
            {
              recipient: _recipient,
              percentage: 2.5,
            },
          ],
          users: [
            {
              etherKey: _uethKey,
              tokens: [
                {
                  // ERC-721
                  id: '1',
                  blueprint: 'my-on-chain-metadata',
                  royalties: [
                    // override global fees on a per-token basis
                    {
                      recipient: _uethKey,
                      percentage: 2.5,
                    },
                  ],
                },
              ],
            },
          ],
        },
      ]);

      setApiResult(`${JSON.stringify(result)}`);
    } catch (e) {
      console.log(e);
      setApiResult(`${JSON.stringify(e)}`);
    }
  };

  return (
    <Page title="Immutable X Testing page">
      <Container>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mt={5}>
          <Typography variant="h4" gutterBottom>
            <img
              src="/static/img/logo3.png"
              alt="login"
              width={50}
              style={{ display: 'inline-block', transform: 'translateY(15px)' }}
            />
            Immutable X
          </Typography>
          <Stack direction="row" alignItems="center" spacing={{ xs: 0.5, sm: 1.5 }}>
            <Button variant="contained" onClick={() => handleConnectWalletClick()}>
              {waddress === '' ? 'CONNECT' : 'LOGOUT'}
            </Button>
          </Stack>
        </Stack>
        <p style={{ textAlign: 'right' }}>
          <strong>WALLET ADDRESS: </strong> {waddress === '' ? '' : waddress}
        </p>
        <p style={{ textAlign: 'right' }}>
          <strong>BALANCE:</strong>
          {balance === '' ? '' : balance}
        </p>

        <Grid container spacing={3} mt={5}>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              variant="contained"
              fullWidth
              style={{ marginBottom: 10 }}
              onClick={() => {
                setApiType('SELL-BUY');
              }}
            >
              Create orders(Sell/Buy)
            </Button>
            <Button
              variant="contained"
              fullWidth
              style={{ marginBottom: 10 }}
              onClick={() => {
                setApiType('MINT');
              }}
            >
              Mint
            </Button>
            <Button
              variant="contained"
              fullWidth
              style={{ marginBottom: 10 }}
              onClick={() => {
                setApiType('TRANSFER');
              }}
            >
              Transfer
            </Button>
            <Button
              variant="contained"
              fullWidth
              style={{ marginBottom: 10 }}
              onClick={() => {
                setApiType('DEPOSIT');
              }}
            >
              Deposit
            </Button>
            <Button
              variant="contained"
              fullWidth
              style={{ marginBottom: 10 }}
              onClick={() => {
                setApiType('WITHDRAWAL');
              }}
            >
              Withdraw
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={5}>
            {apiType === 'SELL-BUY' && (
              <>
                <p>
                  Showing orders, like assets, is best accessed by IMX Client. Usually when making a request for orders
                  you filter on status. The following call will retrieve all the active orders for assets from a
                  specific collection (Collection address : 0xacb3c6a43d15b907e8433077b6d38ae40936fe2c)
                </p>
                <Button variant="contained" onClick={() => handleOrderListClick()}>
                  Order list
                </Button>
                <hr style={{ margin: '20px 0' }} />
                <p>
                  Once you have a user’s assets, use the Link SDK to guide the user through selling an asset
                  <br />
                  <strong>Amount</strong>: price in Ether
                  <br />
                  <strong>TokenId</strong>: user-asset's id
                  <br />
                  <strong>TokenAddress</strong>: user-asset's token address
                  <br />
                </p>
                <FormControl fullWidth sx={{ m: 1 }}>
                  <TextField type="number" id="sell-amount" label="Amount" />
                </FormControl>
                <FormControl fullWidth sx={{ m: 1 }}>
                  <TextField type="text" id="sell-token-id" label="TokenId" />
                </FormControl>
                <FormControl fullWidth sx={{ m: 1 }}>
                  <TextField type="text" id="sell-token-addr" label="TokenAddress" />
                </FormControl>
                <Button variant="contained" onClick={() => handleSellClick()}>
                  Sell
                </Button>
                <hr style={{ margin: '20px 0' }} />
                <p>
                  To fill an existing order, use the Link SDK to guide the user through the signing process. Just call
                  buy with the order's ID
                </p>
                <FormControl fullWidth sx={{ m: 1 }}>
                  <TextField type="text" id="order-id" label="OrderId" />
                </FormControl>
                <Button variant="contained" onClick={() => handleBuyClick()}>
                  Buy
                </Button>
              </>
            )}
            {apiType === 'MINT' && (
              <>
                <p>
                  <strong>User-EtherKey</strong> represents a valid ethereum wallet address that the token will be
                  minted to
                </p>
                <FormControl fullWidth sx={{ m: 1 }}>
                  <TextField type="text" id="contract-addr" label="ContractAddress" />
                </FormControl>
                <FormControl fullWidth sx={{ m: 1 }}>
                  <TextField type="text" id="recipient" label="Recipient" />
                </FormControl>
                <FormControl fullWidth sx={{ m: 1 }}>
                  <TextField type="text" id="user-etherKey" label="user-etherKey" />
                </FormControl>
                <Button variant="contained" onClick={() => handleMintClick()}>
                  Mint
                </Button>
              </>
            )}
            {apiType === 'TRANSFER' && (
              <>
                <p>
                  <strong>TokenId</strong>: user-asset's id
                  <br />
                  <strong>TokenAddress</strong>: user-asset's token address
                  <br />
                  <strong>TokenAddress</strong>: Address To Send To
                  <br />
                </p>
                <FormControl fullWidth sx={{ m: 1 }}>
                  <TextField type="text" id="token-id" label="TokenId" />
                </FormControl>
                <FormControl fullWidth sx={{ m: 1 }}>
                  <TextField type="text" id="token-addr" label="TokenAddress" />
                </FormControl>
                <FormControl fullWidth sx={{ m: 1 }}>
                  <TextField type="text" id="to-address" label="ToAddress" />
                </FormControl>
                <Button variant="contained" onClick={() => handleTransferClick()}>
                  Transfer
                </Button>
              </>
            )}

            {apiType === 'DEPOSIT' && (
              <>
                <p>
                  In order to deposit into Immutable X, a user sends ETH from their wallet to the Immutable X contract.
                  <strong>Amount</strong> Ethereum amount
                </p>
                <FormControl fullWidth sx={{ m: 1 }}>
                  <TextField type="number" id="deposit-amount" label="Amount" />
                </FormControl>
                <Button variant="contained" onClick={() => handleDepositClick()}>
                  Deposit
                </Button>
              </>
            )}
            {apiType === 'WITHDRAWAL' && (
              <>
                <FormControl fullWidth sx={{ m: 1 }}>
                  <TextField type="number" id="withdrawal-amount" label="Amount" />
                </FormControl>
                <Button variant="contained" onClick={() => handleWithdrawalClick()}>
                  Withdraw
                </Button>
              </>
            )}
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="h3" gutterBottom>
              RESULT
            </Typography>
            <pre>{apiResult}</pre>
          </Grid>
        </Grid>

        <PopupDialog
          title="Connect your wallet"
          open={popupOpen}
          onClose={() => {
            setPopupOpen(false);
          }}
          buttons={popupButtons}
        >
          Connect or create your own wallet to access immutable X
        </PopupDialog>
      </Container>
    </Page>
  );
}
