import React from 'react'
import { useState } from 'react';
import "./Ticket.scss"
import woodTicket from '../../assets/img/woodTicket.svg'
import silverTicket from '../../assets/img/silverTicket.svg'
import goldTicket from '../../assets/img/goldTicket.svg'
import sisi from '../../assets/img/maps/Sprites/Npc/sisi.png'
import dowita from '../../assets/img/dowita.png'
import tesaurebox from '../../assets/img/treasure.svg'
import bluebox from '../../assets/img/bluebox.png'
import coinIcon from '../../assets/img/InterfazImg/coin-icon.png';
import Axios from 'axios';
import DropsDirs from '../Interfaz/Drop/DropsDirs'
import { Connection, PublicKey, clusterApiUrl, Transaction, SystemProgram, LAMPORTS_PER_SOL, sendAndConfirmTransaction } from "@solana/web3.js";
import {Token, TOKEN_PROGRAM_ID} from "@solana/spl-token";
const dirImgIcons = "../../assets/img/inventory/DROPS/";

let characterItems = [];
let marketPlaceItems = [];
const ticketsArr =[
  {
    imgUrl:woodTicket,
    name:"wood",
    price:0.1,
    value:10,
    id: 1,
  },
  {
    imgUrl:silverTicket,
    name:"silver",
    price:0.5,
    value:2,
    id: 2,
  },
  {
    imgUrl:goldTicket,
    name:"gold",
    price:1,
    value:1,
    id: 3,
  }
]
  function charactersList(pj){
    return (
      <option key={pj.p_id} value={pj.p_id}>{pj.p_nickname}</option>
    )
  }

  function itemList(items){
    
    return(
      {
        'id':items.id,
        'name':items.name,
        'cant':items.cant,
        'iditem': items.iditem,
        'value':0,
      }
    )
  }

  function marketList(items){
    
    return(
      {
        'id':items.id,
        'name':items.name,
        'cant':items.cant,
        'iditem': items.iditem,
        'price':items.price,
        'seller':items.pjseller,
        'payType':items.itemtype,
        'pjname':items.pjname,
      }
    )
  }
  function loadcharacters(props){
    //console.log(props)
    let characters = [];
    if(props.data.state.loadcharacters===true){
     // console.log(props.data.state.GlobalAllPjData.length)
      characters = props.data.state.GlobalAllPjData.map(charactersList);
    }else{
      characters = '<option>Debe cargar su lista de personajes</option>';
    }

    return characters;
  }

  

function Market(props) {
  const senSolToPool = async (v) => {
    //console.log("AQUI!!!!");
    let provider = global.config.datawallet 
    let poolrewardaccount = new PublicKey(process.env.REACT_APP_POOL_ACCOUNT);
    const connection = new Connection(process.env.REACT_APP_SOLANA_RPC_HOST, "confirmed");
    let ownerPublickey = new PublicKey(localStorage.phantomWalletKey);
    let blockhash = await connection.getLatestBlockhash();
    let transaction = new Transaction();

    transaction.add( SystemProgram.transfer({
      fromPubkey: ownerPublickey,
      toPubkey: poolrewardaccount,
      lamports: (1000000000 * v),
    }));

    transaction.recentBlockhash= blockhash.blockhash;
    transaction.feePayer= ownerPublickey;
    let { signature } = await provider.signAndSendTransaction(transaction).catch((error) => {
      console.error(error);
    });

    let finaltx = await connection.confirmTransaction(signature); 
    console.log(finaltx.value.err);
    if(finaltx.value.err===null && signature){
      return {'status':true,'signature':signature};
    }

  }

  async function sendTransactionSell(valuetosend){
    console.log("comprando a sisi");
    
    const publicKey = localStorage.phantomWalletKey;
    const timestamp = Date.now();
    const nonce = `${publicKey}${timestamp}`;
    


    //let nonce = await getNonce(nonceTmp,publicKey,timestamp,1);
    let provider = global.config.datawallet 
    const connection = new Connection(process.env.REACT_APP_SOLANA_RPC_HOST, "confirmed");
    let mintaddress = process.env.REACT_APP_SOL_MINT_ADDRESS;
    let ownerPublickey = new PublicKey(localStorage.phantomWalletKey);
    let poolrewardaccount = new PublicKey(process.env.REACT_APP_POOL_ACCOUNT);
    let blockhash = await connection.getLatestBlockhash();
      
    let PIOLY_pubkey = new PublicKey(mintaddress);
    let PIOLY_Token = new Token(
      connection,
      PIOLY_pubkey,
      TOKEN_PROGRAM_ID,
      ownerPublickey
    ); 
  
    let fromTokenAccount = await PIOLY_Token.getOrCreateAssociatedAccountInfo(ownerPublickey);
    let toTokenAccount = await PIOLY_Token.getOrCreateAssociatedAccountInfo(poolrewardaccount);
  
    let tx = new Transaction();
    tx.add(
      Token.createTransferInstruction(
        TOKEN_PROGRAM_ID,
        fromTokenAccount.address,
        toTokenAccount.address,
        ownerPublickey,
        [],
        (1000000000 * valuetosend),
        {nonce}
      )
    );
    
    tx.recentBlockhash = blockhash.blockhash;
    tx.feePayer = ownerPublickey;

    let { signature } = await provider.signAndSendTransaction(tx).catch((error) => {
      console.error(error);
    });

    //this.saveticket(signature,pjid,(LAMPORTS_PER_SOL / value));
    console.log("signature: "+signature);
    let finaltx = await connection.confirmTransaction(signature); 
    console.log(finaltx);
    console.log(finaltx.value.err);
    if(finaltx.value.err===null && signature){
      return true;
    }
 }
  

  function getVal(idcant){
    let cantNum=document.getElementById(idcant).value;
    return cantNum;
  }
  
  async function sellItem(itemid,cant,price,pjid,type,maxcant){
    //if type is 1 sell in SOL
    //if type is 2 sell in Pioly
    if( (parseInt(cant)<=0) || !cant || cant===null || cant===undefined || cant===''){
      alert("choose another cant")
      return false
    }
    if( (parseInt(pjid)<=0) || !pjid || pjid===null || pjid===undefined || pjid===''){
      alert("choose character seller")
      return false
    }
    if( (parseFloat(price)<=0) || !price || price===null || price===undefined || price===''){
      alert("choose your price")
      return false
    }

    if(cant>maxcant){
      alert("you don't have enough");
      return false
    }

    //sendTransactionSell(1);
    if(type===1){
      let sendTokenToPool = await sendTransactionSell(cant);
      if(sendTokenToPool===true){
        //hago insert en la base de datos de venta
        Axios.post(global.config.server.url+"sellItem",{
          pj_id: pjid,
          itemid: itemid,
          cant: parseInt(cant),
          price: parseFloat(price),
          pjid: pjid,
          type: type,
        }).then((response)=>{
          if (response.status===200) {
            alert("your item is now available on the marketplace");
            setloadMarketplace(false);
            getItemsPj(pjid)
            console.log(response)                                                                                                          
          } else {
              alert("bd conexion error");
          } 
        })
      }else{
        alert("Error in tx, maybe you need Pioly coin");
        return false;
      }
      //retorno una tx que envie los pioly a la pool si es exitosa la tx que me devuelva datos
      //luego insertar en la tabla de venta de items
    }else{
      //si es item restar la cantidad disponible en el inventario del jugador
      //luego insertar en la tabla de venta de items
      Axios.post(global.config.server.url+"sellItem",{
        pj_id: pjid,
        itemid: itemid,
        cant: parseInt(cant),
        price: parseFloat(price),
        pjid: pjid,
        type: type,
      }).then((response)=>{
        if (response.status===200) {
          alert("your item is now available on the marketplace");
          setloadMarketplace(false);
          getItemsPj(pjid)
          console.log(response)                                                                                                          
        } else {
            alert("bd conexion error");
        } 
      })
    }




     
    //console.log(itemid,cant,price,pjid,type);
  }

  async function getItemsPj(pjid){
    //const [items, setItems] = useState();
    Axios.post(global.config.server.url+"getInv",{
      pj_id: pjid,
  }).then((response)=>{
      ////!(response)
     // console.log(response)
      if (response.status===200) {
        characterItems = (response.data.map(itemList))
        //console.log(characterItems)
        setItemslist(characterItems)
                                                                                                                  
      } else {
          alert("bd conexion error");
      } 
  }) 
  }


  //Get all items selling
  async function getMarketPlace(){
    //const [items, setItems] = useState();
    Axios.post(global.config.server.url+"getMarket",{
      pj_id: null,
  }).then((response)=>{
      ////!(response)
      console.log(response)
      if (response.status===200) {
        marketPlaceItems = (response.data.map(marketList))
        //console.log(characterItems)
        setMarketlist(marketPlaceItems)
                                                                                                                  
      } else {
          alert("bd conexion error");
      } 
  }) 
  }
  //All items selling
  

  async function buyItemP2p(d,pjid){
    
    if( (parseInt(pjid)<=0) || !pjid || pjid===null || pjid===undefined || pjid===''){
      alert("choose character seller")
      return false
    }

    console.log("AQUI===>",d)
    if(d.iditem===1){
      //buy in sol
      let payItem = await senSolToPool(d.price);
      console.log(payItem)
      if(payItem.status===true){
        //send pioly
        Axios.post(global.config.server.url+"buyPiolyP2p",{
          pj_id: pjid,
          data: d,
          tx: payItem.signature,
      }).then((response)=>{
          ////!(response)
          console.log(response)
          if (response.status===200) {
            alert("In a few minutes you will be able to see the $PIOLY COIN in your wallet, thanks for using the P2P market");
            setloadMarketplace(false);
            getItemsPj(pjid);
                                                                                                                      
          } else {
              alert("bd conexion error");
          } 
      }) 
      }
    }else{
      //buy in pioly
      //cobrar el pioly y enviarlo al back
      let sendTokenToPool = await sendTransactionSell(d.price);
      if(sendTokenToPool===true){
        //hago insert en la base de datos de venta
        Axios.post(global.config.server.url+"buyItemP2p",{
          pj_id: pjid,
          data: d,
        }).then((response)=>{
          if (response.status===200) {
            alert("Your purchased items are now available in your inventory");
            setloadMarketplace(false);
            getItemsPj(pjid)
            console.log(response)                                                                                                          
          } else {
              alert("bd conexion error");
          } 
        })
      }
    }
  }
  
  async function blueboxTx(pjidtmp){
    if( (parseInt(pjidtmp)<=0) || !pjidtmp || pjidtmp===null || pjidtmp===undefined || pjidtmp===''){
      alert("choose character seller")
      return false
    }
    if (window.confirm("Do you want to trade your blue apples to get something from the chest? You could lose your apples and get nothing. If you are sure, may the blessing of the rainbow spirit and Solana be with you")) {
      Axios.post(global.config.server.url+"bluebox",{
        pj_id: pjidtmp,
        }).then((response)=>{
            ////!(response)
            //console.log(response)
            if (response.status===200) {
  
              alert(response.data.message);
              setloadMarketplace(false);
              getItemsPj(pjid);
                                                                                                                        
            } else {
                alert("bd conexion error");
            } 
        }) 
    }
   

    //console.log(pjidtmp)
  }
  async function buyItem(npc,cant,itemid,price,pjid){

    if( (parseInt(cant)<=0) || !cant || cant===null || cant===undefined || cant===''){
      alert("choose another cant")
      return false
    }
    if( (parseInt(pjid)<=0) || !pjid || pjid===null || pjid===undefined || pjid===''){
      alert("choose character seller")
      return false
    }
    


    //console.log(npc,cant,itemid,price,pjid)
    let piolyCant = cant * price;
    if(npc===1){
      //if u but to npc Sissi
      let sendTokenToPool = await sendTransactionSell(piolyCant);
      if(sendTokenToPool===true){
        //agregar este item al inventario
        Axios.post(global.config.server.url+"addItemBuy",{
          pj_id: pjid,
          cant: cant,
          itemid: itemid,
          price: price,
      }).then((response)=>{
          ////!(response)
          console.log(response)
          if (response.status===200) {
            alert("Sissi: thank you for your purchase");
            setloadMarketplace(false);
            getItemsPj(pjid);
                                                                                                                      
          } else {
              alert("bd conexion error");
          } 
      }) 
      }
    }else{
      //if u buy to another player
    }
    
  }

  const [tickets, setTickets ] = useState(ticketsArr);
  const [itemslist, setItemslist ] = useState(characterItems);
  const [marketlist, setMarketlist ] = useState(marketPlaceItems);
  const [loadMarketplace, setloadMarketplace ] = useState(false);
  const [pjid, setPjId] = useState(0);
  let open = props.data.state.VmenuActive_market;

 
  if(open){
    if(loadMarketplace===false){
      getMarketPlace();
      setloadMarketplace(true);
    }
    return (
      
      <div className='market'>
        <span>Marketplace</span>
        <select value={pjid} onChange={e => ((getItemsPj(e.target.value)),setPjId(e.target.value))}>
        <option>...</option>
				  {loadcharacters(props)}
			  </select>
        <div className='market_items_users'>
        <span >You can sell your items...</span>
        
        <div className='market__container'>
        <div key="sendpioly">
              <ul>
                <li><img width='26px' height='26px' src={coinIcon}/></li>
                <li><i>Pioly</i></li>
                <li><i>cant:</i></li>
                <li><input type="number" id="cantPioly"></input></li>
                <li><i>SOL-Price:</i></li>
                <li><input type="number" id="pricePioly"></input></li>
                <li><button onClick={()=>{sellItem(1,getVal("cantPioly"),getVal("pricePioly"),pjid,1,100)}} className='market__item' key="sendpiolybtn">
              Sell ☉
              </button></li>
              </ul>
            </div>
          {itemslist.map(i =>{
            if(i.iditem!==1){
              return(<div key={i.id}>
              <ul>
                <li><img width='26px' height='26px' src={DropsDirs[i.name]}/></li>
                <li><i>{i.name}</i></li>
                <li><i>cant: {i.cant}</i></li>
                <li><input type="number" id={"item"+i.iditem}></input></li>
                <li><i>Price:</i></li>
                <li><input type="number" id={"price"+i.iditem}></input></li>
                <li><button onClick={()=>{sellItem(i.iditem,getVal("item"+i.iditem),getVal("price"+i.iditem),pjid,2,i.cant)}} className='market__item' key={i.id}>
                
              Sell <img className='imgIcoBtnPioly' width='18px' height='18px' src={coinIcon}></img>
              </button></li>
              
              </ul>
            </div>)
            }else{
              return (<></>)
            }
            
          })}
        </div>


        </div>
        <div className='msg_sissi'><img src={sisi}/>
        <span >I sell all you need in Pioly token</span><img width='26px' height='26px' src={coinIcon}></img></div>        
        <div className='market__container'>        
          <div key='1'>
              <ul>
                <li><img width='26px' height='26px' src={DropsDirs['apple']}/></li>
                <li><i>Apple</i></li>
                <li><i>Cost: 0.1</i></li>
                <li><input type="number" id="sapple"></input></li>               
                <li><button onClick={()=>{buyItem(1,getVal("sapple"),2,0.1,pjid)}} className='market__item' key='1'>
                {/* <img width='26px' height='26px' src={coinIcon}></img> */} Buy <img className='imgIcoBtnPioly' width='18px' height='18px' src={coinIcon}></img>
              </button></li>
              </ul>
            </div>

            <div key='2'>
              <ul>
                <li><img width='26px' height='26px' src={DropsDirs['carrot']}/></li>
                <li><i>Carrot</i></li>
                <li><i>Cost: 0.3</i></li>
                <li><input type="number" id="scarrot"></input></li>               
                <li><button onClick={()=>{buyItem(1,getVal("scarrot"),3,0.3,pjid)}} className='market__item' key='2'>
                {/* <img width='26px' height='26px' src={coinIcon}></img> */} Buy <img className='imgIcoBtnPioly' width='18px' height='18px' src={coinIcon}></img>
              </button></li>
              </ul>
            </div>

            <div key='3'>
              <ul>
                <li><img width='26px' height='26px' src={DropsDirs['iron']}/></li>
                <li><i>Iron</i></li>
                <li><i>Cost: 1000</i></li>
                <li><input type="number" id="siron"></input></li>               
                <li><button onClick={()=>{buyItem(1,getVal("siron"),4,1000,pjid)}} className='market__item' key='3'>
                {/* <img width='26px' height='26px' src={coinIcon}></img> */} Buy <img className='imgIcoBtnPioly' width='18px' height='18px' src={coinIcon}></img>
              </button></li>
              </ul>
            </div>

            <div key='4'>
              <ul>
                <li><img width='26px' height='26px' src={DropsDirs['coal']}/></li>
                <li><i>Coal</i></li>
                <li><i>Cost: 1000</i></li>
                <li><input type="number" id="scoal"></input></li>               
                <li><button onClick={()=>{buyItem(1,getVal("scoal"),5,1000,pjid)}} className='market__item' key='4'>
                {/* <img width='26px' height='26px' src={coinIcon}></img> */} Buy <img className='imgIcoBtnPioly' width='18px' height='18px' src={coinIcon}></img>
              </button></li>
              </ul>
            </div>

            <div key='5'>
              <ul>
                <li><img width='26px' height='26px' src={DropsDirs['wood']}/></li>
                <li><i>Wood</i></li>
                <li><i>Cost: 1000</i></li>
                <li><input type="number" id="swood"></input></li>               
                <li><button onClick={()=>{buyItem(1,getVal("swood"),6,1000,pjid)}} className='market__item' key='5'>
                 Buy <img className='imgIcoBtnPioly' width='18px' height='18px' src={coinIcon}></img>
              </button></li>
              </ul>
            </div>

            <div key='6'>
              <ul>
                <li><img width='26px' height='26px' src={bluebox}/></li>
                <li><i>Blue Box</i></li>
                <li><i>Cost: 35</i></li>            
                <li><button onClick={()=>{blueboxTx(pjid)}} className='market__item' key='6'>
                Buy <img className='imgIcoBtnPioly' width='18px' height='18px' src={DropsDirs['blueapple']}></img>
              </button></li>
              </ul>
            </div>
        </div>


        <div className='msg_sissi'><img  width='100px' height='100px' src={dowita}/>
        <span > All dowers sell their items </span> <img width='30px' height='30px' src={tesaurebox}></img></div> 
      {/*   <div className='ticket__container'>
          {tickets.map(ticket =>(
            <div key={ticket.id}>
              <img src={ticket.imgUrl}/>
              <button onClick={()=>{props.data.sendTicket(ticket.value,pjid)}} className='ticket__item' key={ticket.id}>
              Buy {ticket.name} Ticket {ticket.price} Solana
              </button>
            </div>
          ))}
        </div> */}
      
        {<div className='market__container'>
          {marketlist.map(i =>{
            
              return(<div key={i.id}>
              <ul>
                <li><img width='26px' height='26px' src={i.iditem===1 ? coinIcon : DropsDirs[i.name]}/></li>
                <li><i>{i.pjname}</i></li>
                <li><i>{i.name}</i></li>
                <li><i>cant: {i.cant}</i></li>
                <li><i>Price: {i.price}</i></li>
                <li><button onClick={()=>{buyItemP2p(i,pjid)}} className='market__item' key={i.id}>
              Buy {i.iditem===1 ? "☉":<img className='imgIcoBtnPioly' width='18px' height='18px' src={coinIcon}></img>}
              </button></li>
              </ul>
            </div>)
           
            
          })}
        </div>} 
      </div>
    )
  }else{
    return <></>
  }
}

export {Market};
