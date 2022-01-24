import React, {useState, useEffect} from 'react'
import Box from '@material-ui/core/Box';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import TabPanel from './TabPanel';
import TokenInfoTable from './TokenInfoTable';
import { makeStyles } from '@material-ui/core/styles';
import MarketLoadButton from './MarketLoadButton';
import { MARKETS_LIST, Market } from '@project-serum/serumx';
import BuyPanel from './BuyPanel';
import OrderTable from './OrderTable';
import MyOrderTable from './MyOrderTable';
import OrderForm from './OrderForm';
import OrderFormV2 from './OrderFormV2';
import MarketData from './MarketData';
import CancelAllButton from './CancelAllButton';
import MarketMenu from './MarketMenu';
import { PublicKey, Keypair } from '@safecoin/web3.js';
import { useWallet } from '../utils/wallet';
import SERUM from '../KEYS/SERUM-2.json';
import SettleButton from './SettleButton';
let serum = Keypair.fromSecretKey(Buffer.from(SERUM));

function MarketComponent(props) {
  return (<><h1>Hello</h1>
    {MARKETS_LIST.map((m) => (m.name))}
    <MarketLoadButton></MarketLoadButton></>)

}

function a11yProps(index) {
  return {
    id: `scrollable-auto-tab-${index}`,
    "aria-controls": `scrollable-auto-tabpanel-${index}`
  };
}

const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 1,
    width: "100%",
    backgroundColor: theme.palette.background.paper
  }
}));

const addr_to_idx = (addr)=>{
  let filtered = MARKETS_LIST.filter((mkt)=>(mkt.address == addr));
  if (filtered.length > 0){
    let selected = filtered[0];
    return selected.seq;
  }
  return 0;
}


export default function TabGuts() {
  const wallet = useWallet();
  const classes = useStyles();
  const [value, setValue] =  useState(0);
  const [marketIdx, setMarketIdx] = useState(0);
  const [market, setMarket] = useState<any>(null);

  useEffect(() => {
    async function getMarket() {
      let addr = MARKETS_LIST[marketIdx].address;
      let key = new PublicKey(addr);

      let loaded = await Market.load(wallet.connection,key,{},serum.publicKey);
      console.log("loaded: ",loaded);

      setMarket(loaded);
    }

    getMarket();
  }, [])

  function handleChange(event, newValue) {
    setValue(newValue);
  }
  
  const changeMarket = async (marketKey :PublicKey)=>{
    let idx : number = addr_to_idx(marketKey)
    let loaded = await Market.load(wallet.connection,marketKey,{},serum.publicKey);
    console.log("loaded: ",loaded);
    setMarketIdx(idx);
    setMarket(loaded);
  }

  return (<>
    <Box>
      Current Market: <MarketMenu label={MARKETS_LIST[marketIdx].name} onChangeMarket={changeMarket}/>
      <Tabs
        value={value}
        onChange={handleChange}
        indicatorColor="primary"
        textColor="primary"
        variant="scrollable"
        scrollButtons="auto"
        aria-label="scrollable auto tabs example"
      >
        <Tab label="Ignore" {...a11yProps(0)} />
        <Tab label="Buy Something" {...a11yProps(1)} />
        <Tab label="OrderBook" {...a11yProps(2)} />
        <Tab label="OrderForm" {...a11yProps(3)} />
        <Tab label="Do Cancelling/Settling" {...a11yProps(4)} />
        <Tab label="Token Info" {...a11yProps(5)} />
        <Tab label="Market Info" {...a11yProps(6)} />
        <Tab label="MyOrders" {...a11yProps(7)} />

      </Tabs>
    </Box>
    <TabPanel value={value} index={0}>
      <MyOrderTable market ={market} />
    </TabPanel>
    <TabPanel value={value} index={1}>
      <BuyPanel />
    </TabPanel>
    <TabPanel value={value} index={2}>
      <OrderTable market={market}/>
    </TabPanel>
    <TabPanel value={value} index={3}>
      <OrderFormV2 market={market}/>
    </TabPanel>
    <TabPanel value={value} index={4}>
    <SettleButton market={market}/>
    <br/>
    <CancelAllButton market={market}/>

    </TabPanel>
    <TabPanel value={value} index={5}>
     <TokenInfoTable/>
    </TabPanel>
    <TabPanel value={value} index={6}>
      <MarketData market={market}/>
    </TabPanel>
    <TabPanel value={value} index={7}>
    </TabPanel>
  </>);
}
