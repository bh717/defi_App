import React, { useState, useEffect } from "react";
import { connect, useSelector } from 'react-redux'
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Tooltip, { TooltipProps, tooltipClasses } from "@mui/material/Tooltip";
import { ChakraProvider, useDisclosure } from "@chakra-ui/react";
import Select from '@mui/material/Select';
import FootNote from './FootNote';
//import Layout from "./Layout";
import ConnectButton from "./ConnectButton";
import AccountModal from "./AccountModal";
import {
    portfolio_data1, portfolio_data2,
    // portfolio_table_data
} from "../service/constants"
import CryptoIcon from "./../Components/CryptoIcon"
const NoMaxWidthTooltip = styled(({ className, ...props }: TooltipProps) => (
    <Tooltip {...props} classes={{ popper: className }} />
))({
    [`& .${tooltipClasses.tooltip}`]: {
        maxWidth: 'none',
    },
});
//20138207
//https://api.polygonscan.com/api?module=block&action=getblockreward&blockno=20138207&apikey=61KZHYEFZRVZPPHR1STRS2USVZ3N4V5MJP
//https://api.polygonscan.com/api?module=contract&action=getabi&address=0x510d776fea6469531f8be69e669e553c0de69621&apikey=61KZHYEFZRVZPPHR1STRS2USVZ3N4V5MJP
//https://api.polygonscan.com/api?module=account&action=tokentx&address=0x704111eDBee29D79a92c4F21e70A5396AEDCc44a&startblock=20138207&endblock=20138207&sort=asc&apikey=61KZHYEFZRVZPPHR1STRS2USVZ3N4V5MJP
const Portfolio = ({ data, updateMenu, openMenu, allowedMenu, allowMenu }) => {
    const [portfolio_table1, setPortfolio_table1] = useState(portfolio_data1)
    const [portfolio_table2, setPortfolio_table2] = useState(portfolio_data2)
    const [portfolio_table_body_data, setPortfolio_table_body] = useState([])
    const [selHeader1, setSelHeader1] = useState(10)
    const [selHeader2, setSelHeader2] = useState(10)
    const [sort_state, setSort_state] = useState(false)
    const [typeValue, setTypeValue] = useState('all')
    const [chainValue, setChainValue] = useState('all')
    const [filterButton, setFilterButton] = useState(false)
    const [sort_image, setSort_image] = useState(`${process.env.PUBLIC_URL}/assets/images/sort_both.png`)
    const [type, setType] = React.useState('All');
    const [chain, setChain] = React.useState('All');
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [getTotalVal, setTotalVal] = useState({ totalCost: 0, totalValue: 0, totalValueStr: 0 })
    // const [isLoading,setIsLoading]= useState(false)
    /*const isLoading = useSelector(
        state => state.isLoading
    )*/
    const portfolioPreData = useSelector(state => state.portfolioData);
    const footnotesPreData = useSelector(state => state.footnoteData);
    const [portfolioData, setportfolioData] = useState([]);
    const [footnotes, setFootnotes] = useState([]);
    const [isShowSmall, setIsShowSmall] = useState(false);

    /*const resizeValue = (e) => {
        console.log(e)
    }*/
    const showSmallPositions = (isShow) => {
        setIsShowSmall(isShow);
    }
    const handleChangeType = (event) => {
        setType(event.target.value);
        removeClass_show()
        addClass_collapsed()
    };
    const handleChangeChain = (event) => {
        setChain(event.target.value);
        removeClass_show()
        addClass_collapsed()
    };
    const handleChangeShowSmallCheck = (event) => {
        setIsShowSmall((show) => !show);
    }
    /*const makeHistory = (historyData) => {
        let data = []
        let level_0 = 0
        let level_1 = 0
        let level_2 = 0
        let level_3 = 0
        historyData.map((item, index) => {
            if (item.hierarchy_level == 0) {
                Object.assign(item, { child: [] })
                data.push(item)
                level_0++
                level_1 = 0
            } else if (item.hierarchy_level == 1) {
                Object.assign(item, { child: [] })
                data[level_0 - 1].child.push(item)
                level_1++
                level_2 = 0
            } else if (item.hierarchy_level == 2) {
                Object.assign(item, { child: [] })
                data[level_0 - 1].child[level_1 - 1].child.push(item)
                level_2++
            }
            else if (item.hierarchy_level == 3) {
                Object.assign(item, { child: [] })
                data[level_0 - 1].child[level_1 - 1].child[level_2 - 1].child.push(item)
                level_3++
            }
        })
        console.log(data, 'history data-----------')
        return data
    }*/
    useEffect(() => {
        /*if (openMenu) {
            updateMenu();
        }
        allowMenu(false);*/
        setportfolioData(portfolioPreData.map(item => {
            const profit = item.value - item.cost_basis
            const retu = (item.value - item.cost_basis) / item.cost_basis * 100

            history_round(item.history);

            return {
                id: item.id,
                chain: item.chain,
                chain_id: item.chain_id,
                chain_logo: item.chain_logo,
                type: item.type,
                type_img: item.type_img,
                protocol: item.protocol ?? "",
                protocol_url: item.protocol_url,
                protocol_logo: item.protocol_logo,
                pool: item.pool,
                assets: item.assets,
                units: item.units,
                units_str: special_round(item.units),
                cost_basis: item.cost_basis,
                cost_basis_str: special_round_usd(item.cost_basis),
                value: item.value,
                value_str: special_round_usd(item.value),
                _comment: item._comment,
                profit,
                profit_str: special_round_usd(profit),
                return: retu,
                return_str: special_round(retu, 0.01),
                history: item.history,
                tx_count: item.txCount,
                tx_date: item.lastTxDate
                // history: item.history?item.history.length>0?makeHistory(item.history):[]:[]
            }
        }))
    }, [portfolioPreData]);

    useEffect(() => {
        setFootnotes(footnotesPreData.map(item => {
            return {
                chain: item.chain,
                totalTx: item.totalTxCount,
                pageTx: item.currentTxCount,
                lastTxDate: item.lastTxDate
            }
        }))
    }, [footnotesPreData])

    useEffect(() => {
        setPortfolio_table_body(portfolioData)
        calc_totalVal(portfolioData)
    }, [portfolioData]);

    // .replace(/\B(?=(\d{3})+(?!\d))/g, ",")

    const history_round = (arr) => {
        if (!arr || arr.length === 0) return

        for (let i in arr) {
            const item = arr[i]

            item.cost_basis_str = special_round_usd(item.cost_basis)
            item.fee_usd_str = special_round_usd(item.fee_usd)
            item.units_str = special_round(item.units)

            //console.log(item.units, item.units_str, item.token_name)

            history_round(item.child)
        }
    }

    const calc_totalVal = (data) => {
        const obj = {
            totalCost: data.map((item) => {
                return item.cost_basis
            }).reduce((a, b) => a + b, 0),
            totalValue: data.map((item) => {
                return item.value
            }).reduce((a, b) => a + b, 0)
        }

        obj.totalValueStr = obj.totalValue.toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")

        setTotalVal(obj)
    }

    const special_round_usd = (value) => {
        if (!value) return "$0.00"
        if (value > 0 && value < 0.01)
            return "<$0.01"

        if (value < 0 && value > -0.01)
            return "-<$0.01"

        let v = value.toFixed(2)
        let r = ''
        if (value < 0) {
            r += '-'
            v = -v
        }
        r += '$' + v.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
        return r
    }

    const special_round = (value, def = 0.00001) => {
        let sign = ''
        let gt = '<'
        let sigValue = value
        if (value < 0) {
            sign = '-'
            gt = '<'
            sigValue = -value
        }

        if (sigValue > 0 && sigValue < def)
            return `${sign}${gt}${def}`

        if (sigValue > 0 && sigValue < 0.01)
            return `${sign}${gt}${(Math.round((value + Number.EPSILON) * 100000) / 100000)}`;
        return (Math.round((value + Number.EPSILON) * 100) / 100).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
    }
    //   const calDate=(val)=>{
    //       const milliseconds = val * 1000
    //       const dateObject = new Date(milliseconds)
    //       let ampm = dateObject.getUTCHours()>12?'PM':'AM'
    //       const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    //       const humanDateFormat = months[dateObject.getMonth()]+'-'+dateObject.getDate()+'-'+dateObject.getFullYear()+' '+(dateObject.getUTCHours() % 12)+':'+dateObject.getMinutes()+':'+dateObject.getSeconds()
    //       +' '+ampm
    //       return humanDateFormat//setDateData(humanDateFormat)
    //   }
    const onSort_1 = (data) => {
        setSelHeader1(data)
        setSelHeader2(10)
        switch (data) {
            case 0: portfolio_table_body_data.sort(function (a, b) {
                let x = a.type.toLowerCase();
                let y = b.type.toLowerCase();
                if (x < y && sort_state) { return -1; }
                if (x > y && sort_state) { return 1; }
                if (x < y && !sort_state) { return 1; }
                if (x > y && !sort_state) { return -1; }
                return 0;
            }); break;
            case 1: portfolio_table_body_data.sort(function (a, b) {
                let x = a.protocol?.toLowerCase() ?? "";
                let y = b.protocol?.toLowerCase() ?? "";
                if (x < y && sort_state) { return -1; }
                if (x > y && sort_state) { return 1; }
                if (x < y && !sort_state) { return 1; }
                if (x > y && !sort_state) { return -1; }
                return 0;
            }); break;
            case 2: portfolio_table_body_data.sort(function (a, b) {
                let x = a.assets[0].ticker.toLowerCase();
                let y = b.assets[0].ticker.toLowerCase();
                if (x < y && sort_state) { return -1; }
                if (x > y && sort_state) { return 1; }
                if (x < y && !sort_state) { return 1; }
                if (x > y && !sort_state) { return -1; }
                return 0;
            }); break;
            default:
        }
        setSort_state(!sort_state)
        setPortfolio_table_body([...portfolio_table_body_data])
        if (sort_state) setSort_image(`${process.env.PUBLIC_URL}/assets/images/sort_top.png`)
        else if (!sort_state) setSort_image(`${process.env.PUBLIC_URL}/assets/images/sort_bottom.png`)
        removeClass_show()
        addClass_collapsed()
    }
    const onSort_2 = (data) => {
        setSelHeader2(data)
        setSelHeader1(10)
        switch (data) {
            case 0: portfolio_table_body_data.sort(function (a, b) {
                if (sort_state) return b.cost_basis - a.cost_basis
                if (!sort_state) return a.cost_basis - b.cost_basis
                return 0;
            }); break;
            case 1: portfolio_table_body_data.sort(function (a, b) {
                if (sort_state) return b.value - a.value
                if (!sort_state) return a.value - b.value
                return 0;
            }); break;
            case 2: portfolio_table_body_data.sort(function (a, b) {
                if (sort_state) return b.profit - a.profit
                if (!sort_state) return a.profit - b.profit
                return 0;
            }); break;
            case 3: portfolio_table_body_data.sort(function (a, b) {
                if (sort_state) return b.return - a.return
                if (!sort_state) return a.return - b.return
                return 0;
            }); break;
            default:
        }
        setSort_state(!sort_state)
        setPortfolio_table_body([...portfolio_table_body_data])
        if (sort_state) setSort_image(`${process.env.PUBLIC_URL}/assets/images/sort_top.png`)
        else if (!sort_state) setSort_image(`${process.env.PUBLIC_URL}/assets/images/sort_bottom.png`)
        removeClass_show()
        addClass_collapsed()
    }
    const removeClass_show = () => {
        var element = document.getElementsByClassName("collapse1");
        for (var i = 0; i < element.length; i++)
            element[i].classList.remove("show");
    }
    const addClass_collapsed = () => {
        var element = document.getElementsByClassName("td_symbol");
        for (let i = 0; i < element.length; i++)
            element[i].classList.add("collapsed");
        var element_1 = document.getElementsByClassName("margin-right-10");
        for (let i = 0; i < element.length; i++)
            element_1[i].classList.add("collapsed");
    }

    const onFilterType = (value) => {
        let preTable_data = []
        portfolioData.forEach((item, index) => {
            if (chainValue !== 'all') {
                if (value === 'all') {
                    if (item.chain.toLowerCase().includes(chainValue)) {
                        preTable_data.push(item);
                    }
                }
                else if (value !== 'all') {
                    if (item.type.toLowerCase().includes(value)
                        && item.chain.toLowerCase().includes(chainValue)) {
                        preTable_data.push(item);
                    }
                }
                setTypeValue(value);
            }
            else if (chainValue === 'all') {
                if (value === 'all') {
                    preTable_data.push(item);
                    setTypeValue('all');
                }
                else if (value !== 'all')
                    if (item.type.toLowerCase().includes(value)) {
                        preTable_data.push(item);

                    }
                setTypeValue(value);
            }
        }
        )
        setPortfolio_table_body([...preTable_data])
    }
    const onFilterChain = (value) => {
        let preTable_data = []
        //console.log(value, typeValue)
        portfolioData.forEach((item, index) => {
            if (value !== 'all') {
                if (typeValue !== 'all') {
                    if (item.type.toLowerCase().includes(typeValue)
                        && item.chain.toLowerCase().includes(value)) {
                        preTable_data.push(item);
                    }
                }
                else if (typeValue === 'all') {
                    if (item.chain.toLowerCase().includes(value)) {
                        preTable_data.push(item);

                    }
                }
                setChainValue(value);
            }
            else if (value === 'all') {
                if (typeValue !== 'all') {
                    if (item.type.toLowerCase().includes(typeValue)) {
                        preTable_data.push(item);
                        setChainValue(value);
                    }
                }
                else if (typeValue === 'all') {
                    preTable_data.push(item);

                }
                setChainValue('all');
            }

        })
        setPortfolio_table_body([...preTable_data])
    }
    const onFilter = () => {
        setTypeValue('all')
        setChainValue('all')
        setType('All')
        setChain('All')
        switch (filterButton) {
            case false: setFilterButton(true); break;
            case true: setPortfolio_table_body(portfolioData); setFilterButton(false); break;
            default:
        }
    }

    //   const make_child_tree_structure=(data,item,index,index1)=>{
    //         index1++
    //         return <> <div className={data.hierarchy_level == 0 ? "" :"collapse collapse1"}  id={item.id + '-' + data.hierarchy_level} >
    //             <div className="row border-1" >
    //                   <div className="col-3 sub-table-body sub-table-body-level d-flex">

    //                     {item.history.map((item2,index2)=>{
    //                         return <div key={index2} className={index2==data.hierarchy_level?"sub-tree-marker-date1":"sub-tree-marker-date2"} id="aaa" >
    //                             {index2==data.hierarchy_level?<>{item2.hierarchy_level<item.history[item.history.length-1].hierarchy_level?<button className="margin-right-10 collapsed children-date"
    //                                 data-toggle="collapse" target="_blank" href={portfolio_table_body_data[index] ? `#${item.id + '-' + (data.hierarchy_level + 1)}` : ''}></button >
    //                             :<></>}
    //                             <a className="margin-left-10" target="_blank" href={data.transaction_url}title={data.transaction_url}>{data.datetime.slice(0, 23)}</a></>:<></>}
    //                         </div>
    //                     })}
    //                   </div>
    //                   <div className="col-3 sub-table-body sub-table-body-text" title={data.token_url}>
    //                       <a href={data.token_url} target="_blank" className="sub-table-body-text"><img className="sub-table-image" src={data.token_img} />
    //                       {data.token_name}</a>
    //                   </div>
    //                   <div className="col-2 sub-table-body sub-table-body-num">+{data.units.toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</div>
    //                   <div className="col-2 sub-table-body sub-table-body-num">${data.cost_basis.toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</div>
    //                   <div className="col-2 sub-table-body sub-table-body-num">{data.fee_usd?'$'+data.fee_usd.toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","):''}</div>
    //             </div>
    //             {item.history[index1] && item.history[index1].hierarchy_level == item.history[index1-1].hierarchy_level+1? make_child_tree_structure(item.history[index1],item,index,index1):()=>{return<></>}
    //             }
    //         </div>
    //         {item.history[index1] && item.history[index1].hierarchy_level == item.history[index1-1].hierarchy_level? make_child_tree_structure(item.history[index1],item,index,index1):()=>{return<></>}}
    //         </>
    //   }


    function dfs(item, index, num, ele) {
        const nextId = `${item.id}-${ele.hierarchy_level}-${num}`

        const children = ele.child

        return (children && children.length > 0 &&
            children.map((ele1, num1) => {
                return <div key={num1} className={ele1.hierarchy_level === 0 ? "" : "collapse collapse1"} id={nextId} >
                    {make_child_tree_structure(ele1, item, index, 0, num + '' + num1)}
                    {dfs(item, index, num + '' + num1, ele1)}
                </div>
            })
        )
    }

    function make_child_tree_structure(data, item, index, index1, num) {

        //console.log("E:", portfolio_table_body_data[index])

        return <div className="row border-1">
            <div className="col-3 sub-table-body sub-table-body-level d-flex">
                {data.child && data.child.length > 0 ? <button className="margin-right-10 collapsed children-date"
                    style={{ marginLeft: (data.hierarchy_level > 5 ? 50 : data.hierarchy_level * 10) + 'px' }}
                    data-toggle="collapse" target="_blank" href={portfolio_table_body_data[index] ? `#${item.id + '-' + (data.hierarchy_level) + '-' + num}` : ''}></button> : <button style={{ marginLeft: (10 + data.hierarchy_level * 10) + 'px' }}></button>}
                <a className="margin-left-10" target="_blank" rel="noreferrer"
                    href={data.transaction_url} title={data.transaction_url}>
                    {data.datetime.slice(0, 23)}
                </a>
                {/* {item.history.map((item2,index2)=>{
                return <div key={index2} className={index2==data.hierarchy_level?"sub-tree-marker-date1":"sub-tree-marker-date2"} id="aaa" >
                    {index2==data.hierarchy_level?<>{item2.hierarchy_level<item.history[item.history.length-1].hierarchy_level?<button className="margin-right-10 collapsed children-date"
                        data-toggle="collapse" target="_blank" href={portfolio_table_body_data[index] ? `#${item.id + '-' + (data.hierarchy_level + 1)}` : ''}></button >
                    :<></>}
                    <a className="margin-left-10" target="_blank" href={data.transaction_url}title={data.transaction_url}>{data.datetime.slice(0, 23)}</a></>:<></>}
                </div>
            })} */}
            </div>
            <div className="col-3 sub-table-body sub-table-body-text" title={data.token_url}>
                {
                    data.token_url ?
                        <a href={data.token_url} target="_blank" rel="noreferrer"
                            className="sub-table-body-text">
                            <CryptoIcon className="sub-table-image" type="color" name={data.token_img} />
                            {/* <img className="sub-table-image" src={data.token_img} /> */}
                            {data.token_name}
                        </a>
                        :
                        <div className="sub-table-body-text">
                            <CryptoIcon className="sub-table-image" type="color" name={data.token_img} />
                            {/* <img className="sub-table-image" src={data.token_img} /> */}
                            {data.token_name}
                        </div>

                }
            </div>
            <div className="col-2 sub-table-body sub-table-body-num">
                {(data.units > 0 ? '+' : "") + data.units_str}
            </div>
            <div className="col-2 sub-table-body sub-table-body-num">{data.cost_basis_str}</div>
            <div className="col-2 sub-table-body sub-table-body-num">{data.fee_usd_str}</div>
        </div>;
    }

    return (
        <div className="main-board">

            <ChakraProvider >
                <ConnectButton handleOpenModal={() => { }} />
                <AccountModal isOpen={isOpen} onClose={onClose} />
            </ChakraProvider>

            <div className="main-board-title-div d-flex flex-column flex-lg-row">

                <div className="main-board-title-current-value-div">
                    {getTotalVal.totalValueStr.length < 12 ? (<span>Current Value</span>) : <></>}
                    <span className="main-board-title-current-value v100">${getTotalVal.totalValueStr}</span>
                </div>
                <div className="main-board-title-unlealized-profit-div">
                    Unrealized Profit
                    <span className="main-board-title-current-value">{(getTotalVal.totalValue - getTotalVal.totalCost).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}&nbsp;<span className="fontWeight-500">
                        ({getTotalVal.totalCost !== 0 ? ((getTotalVal.totalValue - getTotalVal.totalCost) / getTotalVal.totalCost * 100).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : 0}%)</span></span>
                </div>
                <div className="main-board-title-filter-div " onClick={() => onFilter()} data-toggle="collapse" data-target="#collapseExample" aria-expanded="false" aria-controls="collapseExample">
                    <div className="d-flex main-board-title-filter-btn">
                        <h6 className="main-board-title-filer-title">Filter</h6>
                        <img className="main-board-title-filer-image" src={`${process.env.PUBLIC_URL}/assets/images/filter.jpg`} alt="" />
                    </div>
                </div>
            </div>
            <div className="filter-button-group row collapse" id="collapseExample">
                <Box sx={{ minWidth: 120 }}>
                    <FormControl fullWidth>
                        <InputLabel id="demo-simple-select-label">Type</InputLabel>
                        <Select style={{ borderColor: '#5e5e5e' }}
                            labelId="demo-simple-select-label"
                            id="demo-simple-select"
                            value={type}
                            label="Age"
                            onChange={handleChangeType}
                        >
                            <MenuItem onClick={() => onFilterType('all')} value={'All'}>All</MenuItem>
                            <MenuItem onClick={() => onFilterType('wallet')} value={'Wallet'}>Wallet</MenuItem>
                            <MenuItem onClick={() => onFilterType('yield')} value={'Yield'}>Yield Farming</MenuItem>
                            <MenuItem onClick={() => onFilterType('lending')} value={'Lending'}>Lending</MenuItem>
                        </Select>
                    </FormControl>
                </Box>
                <Box sx={{ minWidth: 120 }}>
                    <FormControl fullWidth>
                        <InputLabel id="demo-simple-select-label">Chain</InputLabel>
                        <Select style={{ borderColor: '#5e5e5e' }}
                            labelId="demo-simple-select-label"
                            id="demo-simple-select"
                            value={chain}
                            label="Age"
                            onChange={handleChangeChain}
                        // onChange={(value)=>onFilterChain(value)}
                        >
                            <MenuItem onClick={() => onFilterChain('all')} value={'All'}>All</MenuItem>
                            <MenuItem onClick={() => onFilterChain('eth')} value={'Ethereum'}>Ethereum</MenuItem>
                            <MenuItem onClick={() => onFilterChain('bsc')} value={'Binance'}>Binance Smart Chain</MenuItem>
                            <MenuItem onClick={() => onFilterChain('polygon')} value={'Polygon'}>Polygon</MenuItem>
                            <MenuItem onClick={() => onFilterChain('avalanche')} value={'Avalanche'}>Avalanche</MenuItem>
                            <MenuItem onClick={() => onFilterChain('fantom')} value={'Fantom'}>Fantom</MenuItem>
                        </Select>
                    </FormControl>
                </Box>
                <Box sx={{ minWidth: 120 }}>
                    <FormControl>
                        <FormControlLabel
                            control={<Checkbox checked={!isShowSmall}
                                onChange={handleChangeShowSmallCheck} defaultChecked />}
                            label="Hide small positions (<1%)"
                            sx={{ color: 'white' }} />
                    </FormControl>
                </Box>
            </div>
            <div className="table-board">
                <table className="table portfolio-table">
                    <thead>
                        <tr className="table-header-tr">
                            <th key="123" className="table-header"></th>
                            {portfolio_table1.map((item, index) => {
                                return <th key={index} className="table-header left-area" onClick={() => onSort_1(index)}>
                                    {item.header.toUpperCase()}
                                    <img className="sort-image"
                                        src={`${process.env.PUBLIC_URL}${index !== selHeader1 ? '/assets/images/sort_both.png' : sort_state ? '/assets/images/sort_top.png' : '/assets/images/sort_bottom.png'}`} alt="" />
                                </th>
                            })}
                            {portfolio_table2.map((item, index) => {
                                const tooltipString = { cost: "Historical Cost", value: "Current Value" };
                                if (item.header === "cost" || item.header === "value") {
                                    return (
                                        <Tooltip key={index} title={tooltipString[item.header]} arrow enterDelay={200} leaveDelay={200}>
                                            <th className="table-header  right-area" onClick={() => onSort_2(index)}>{item.header.toUpperCase()}
                                                <img className="sort-image" src={`${process.env.PUBLIC_URL}${index !== selHeader2 ? '/assets/images/sort_both.png' : sort_state ? '/assets/images/sort_top.png' : '/assets/images/sort_bottom.png'}`} alt="" />
                                            </th>
                                        </Tooltip>);
                                }
                                return <th key={index} className="table-header  right-area" onClick={() => onSort_2(index)}>{item.header.toUpperCase()}
                                    <img className="sort-image" src={`${process.env.PUBLIC_URL}${index !== selHeader2 ? '/assets/images/sort_both.png' : sort_state ? '/assets/images/sort_top.png' : '/assets/images/sort_bottom.png'}`} alt="" />
                                </th>
                            })}
                        </tr>
                    </thead>
                    <tbody>
                        {(() => {
                            const smallThres = portfolio_table_body_data.map((item) => { return item.value }).reduce((a, b) => a + b, 0) * 0.01.toFixed(2);
                            return portfolio_table_body_data.map((item, index) => {
                                if (isShowSmall === false && Math.abs(item.value) < smallThres) return (<></>);
                                return <><tr key={index} className="accordion-toggle table-tr"
                                    id="accordion1" >
                                    {
                                        item.history
                                            ? item.history.length > 0
                                                ? <td className="table-body expand-button td_symbol collapsed" data-toggle="collapse" href={`#${item.id + item.chain}`} ></td>
                                                : <td></td>
                                            : <td></td>
                                    }
                                    <td className="table-body vertical-align-middle second-td"><img className="table-td-s-image" src={`${process.env.PUBLIC_URL}/assets/${item.type_img}`} alt="" />{item.type}</td>
                                    <td className="table-body table-body-protocol vertical-align-middle" title={item.protocol_url}>
                                        <a href={item.protocol_url} className="pt3" target="_blank" rel="noreferrer">
                                            <CryptoIcon className="table-td-m-image table-td-m-image-margin" name={item.type.toLowerCase() === 'wallet' ? item.chain_logo : item.protocol_logo} type={"color"} />{item.protocol}
                                            {/* <img className="table-td-m-image table-td-m-image-margin" src={item.type.toLowerCase()=='wallet'?item.chain_logo:item.protocol_logo} />{item.protocol} */}
                                            {/* <img className="table-td-m-image table-td-m-image-margin" src={item.type.toLowerCase()=='wallet'?():item.protocol_logo} />{item.protocol} */}
                                        </a>
                                    </td>
                                    <td className="table-body d-flex vertical-align-middle">
                                        <div className="table-assets-item d-flex">
                                            {
                                                item.assets.length > 3
                                                    ?
                                                    <NoMaxWidthTooltip className="" title={
                                                        <div className="d-flex">
                                                            {item.assets.map((item4, index4) => { return <CryptoIcon key={index4} className="table-td-m-image" name={item4.logo} type={"color"} /> })}
                                                        </div>
                                                    }
                                                        arrow enterDelay={200} leaveDelay={100}>
                                                        <div className="d-flex">
                                                            {[...item.assets.slice(0, 3)].map((item4, index4) => {
                                                                return (
                                                                    <CryptoIcon key={index4} className="table-td-m-image" name={item4.logo} type={"color"} />
                                                                )
                                                            })}
                                                        </div>
                                                    </NoMaxWidthTooltip>
                                                    : item.assets.map((item4, index4) => { return <CryptoIcon key={index4} className="table-td-m-image" name={item4.logo} type={"color"} /> })
                                            }
                                        </div>
                                        <div className="align-self-center">
                                            {
                                                item.assets.length > 3
                                                    ?
                                                    <Tooltip className="" title={item.assets.reduce((assetStr, item) => assetStr == "" ? item.ticker : assetStr + "+" + item.ticker, "")} arrow enterDelay={200} leaveDelay={100}>
                                                        <div>
                                                            {[...item.assets.slice(0, 3), { ticker: `${item.assets.length - 3}...` }].map((item4, index4) => {
                                                                return (
                                                                    <span className="align-self-center" key={index4}>
                                                                        {index4 === 0 ? item4.ticker : '+' + item4.ticker}
                                                                    </span>
                                                                )
                                                            })}
                                                        </div>
                                                    </Tooltip>
                                                    : item.assets.map((item4, index4) => { return <span className="align-self-center" key={index4}>{index4 === 0 ? item4.ticker : '+' + item4.ticker}</span> })
                                            }
                                        </div>
                                    </td>
                                    <td className="table-body-num vertical-align-middle">{item.cost_basis_str}</td>
                                    <td className="table-body-num vertical-align-middle">{item.value_str}</td>
                                    <td className="table-body-num vertical-align-middle" style={{ color: item.value - item.cost_basis < 0 ? '#dd3279' : 'white' }}>{item.profit_str}</td>
                                    <td className="table-body-num vertical-align-middle" style={{ color: (item.value - item.cost_basis) / item.cost_basis < 0 ? '#dd3279' : 'white' }}>{item.cost_basis > 0 ? `${item.return_str}%` : "N/A"}</td>
                                </tr>
                                    {item.history && item.history.length > 0 && <tr key={index + '-' + index} className="hide-table-padding">
                                        <td colSpan="8" className="collapes-td">
                                            <div id={item.id + item.chain} className="collapse collapse1">
                                                <div className="row border-1">
                                                    {/* <div className="col-2 sub-table-header"> </div> */}
                                                    <div className="col-3 sub-table-header left-area">DATE</div>
                                                    <div className="col-3 sub-table-header left-area">TOKEN</div>
                                                    <div className="col-2 sub-table-header right-area">UNITS</div>
                                                    <div className="col-2 sub-table-header right-area">COST</div>
                                                    <div className="col-2 sub-table-header right-area">FEE</div>
                                                </div>
                                                {item.history && item.history.length > 0 ?
                                                    item.history.map((ele, num) => {
                                                        return <div key={num} className={ele.hierarchy_level === 0 ? "" : "collapse collapse1"} id={item.id + item.chain} >
                                                            {make_child_tree_structure(ele, item, index, 0, num)}

                                                            {dfs(item, index, num, ele)}
                                                            {/* 
                                                        {ele.child && ele.child.length > 0 ?

                                                            ele.child.map((ele1, num1) => {

                                                                return <div key={num1} className={ele1.hierarchy_level == 0 ? "" : "collapse collapse1"} id={item.id + '-' + ele.hierarchy_level + '-' + num} >
                                                                    {make_child_tree_structure(ele1, item, index, 0, num + '' + num1)}
                                                                    {ele1.child && ele1.child.length > 0 ?
                                                                        ele1.child.map((ele2, num2) => {
                                                                            return <div key={num2} className={ele2.hierarchy_level == 0 ? "" : "collapse collapse1"} id={item.id + '-' + ele1.hierarchy_level + '-' + num + '' + num1} >
                                                                                {make_child_tree_structure(ele2, item, index, 0, num + '' + num1 + '' + num2)}
                                                                                {ele2.child && ele2.child.length > 0 ?
                                                                                    ele2.child.map((ele3, num3) => {
                                                                                        return <div key={num3} className={ele3.hierarchy_level == 0 ? "" : "collapse collapse1"} id={item.id + '-' + ele2.hierarchy_level + '-' + num + '' + num1 + '' + num2} >
                                                                                            {make_child_tree_structure(ele3, item, index, 0, num3)}
                                                                                                </div>
                                                                                    })
                                                                                    : null}
                                                                                    </div>
                                                                        })
                                                                        : null}
                                                                        </div>
                                                            })
                                                            : null} */}
                                                        </div>
                                                    })
                                                    : null
                                                }
                                            </div>
                                        </td>
                                    </tr>}
                                </>
                            })
                        })()}
                        {portfolio_table_body_data.length > 0 && !isShowSmall
                            && (<tr className="total-tr">
                                <td colSpan="8">
                                    <Button variant="text"
                                        onClick={() => showSmallPositions(true)}
                                        sx={{ textTransform: 'none' }}>
                                        {"Protocols with small deposits are not displayed(<1%). Show all"}
                                    </Button>
                                </td>
                            </tr>)
                        }
                        {portfolio_table_body_data.length > 0 ?
                            <tr className=" total-tr">
                                <td></td>
                                <td colSpan="3" className="table-total-title">Total</td>
                                <td className="table-total-td table-body-num">
                                    ${portfolio_table_body_data.map((item) => { return item.cost_basis }).reduce((a, b) => a + b, 0).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                                </td>
                                <td className="table-total-td table-body-num">
                                    ${portfolio_table_body_data.map((item) => { return item.value }).reduce((a, b) => a + b, 0).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                                </td>
                                <td className="table-total-td table-body-num"
                                    style={{
                                        color: (portfolio_table_body_data.map((item) => { return item.value }).reduce((a, b) => a + b, 0)
                                            - portfolio_table_body_data.map((item) => { return item.cost_basis }).reduce((a, b) => a + b, 0)) < 0 ? '#dd3279' : 'white'
                                    }}>
                                    ${Math.abs(portfolio_table_body_data.map((item) => { return item.value }).reduce((a, b) => a + b, 0)
                                        - portfolio_table_body_data.map((item) => { return item.cost_basis }).reduce((a, b) => a + b, 0)).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                                </td>
                                <td className="table-total-td table-body-num"
                                    style={{
                                        color: (portfolio_table_body_data.map((item) => { return item.value }).reduce((a, b) => a + b, 0)
                                            - portfolio_table_body_data.map((item) => { return item.cost_basis }).reduce((a, b) => a + b, 0))
                                            / portfolio_table_body_data.map((item) => { return item.cost_basis }).reduce((a, b) => a + b, 0)
                                            * 100 < 0 ? '#dd3279' : 'white'
                                    }}
                                >
                                    {Math.round((portfolio_table_body_data.map((item) => { return item.value }).reduce((a, b) => a + b, 0)
                                        - portfolio_table_body_data.map((item) => { return item.cost_basis }).reduce((a, b) => a + b, 0))
                                        / portfolio_table_body_data.map((item) => { return item.cost_basis }).reduce((a, b) => a + b, 0)
                                        * 100).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}%
                                </td>
                            </tr>
                            : <tr className=" total-tr total-tr-no-data"><td colSpan="8"> There is no data</td></tr>}
                    </tbody>
                </table>
                <FootNote footnotes={footnotes} />
            </div>

        </div>

    )
}
// export default Portfolio
const mapStateToProps = state => ({
    portfolio_data: state.portfolioData,
    wallet_address: state.walletAddress,
    isLoading: state.isLoading
})

//connect function INJECTS dispatch function as a prop!!
export default connect(mapStateToProps)(Portfolio);
