import React, { useState } from 'react';
import Web3 from 'web3';

    function AddToken({addNewToken}){
    const [newToken, setNewToken] = useState({
        tokenTicker: '',
        tokenAddress: ''
    });

    const onSubmit = (e) => {
        e.preventDefault();
        console.log(newToken.tokenTicker.toString());
        console.log(newToken.tokenAddress.toString());
        addNewToken(newToken.tokenTicker, newToken.tokenAddress);
      }

return (
    <div id="orders" className="card">
      <h2 className="card-title">Add Token</h2>
      <form onSubmit={(e) => onSubmit(e)}>
        <div className="form-group row">
          <label className="col-sm-4 col-form-label" htmlFor="token-ticker">Ticker</label>
          <div className="col-sm-8">
            <input 
              type="text" 
              className="form-control" 
              id="token-ticker" 
              onChange={({ target: { value }}) => setNewToken(newToken => ({ ...newToken, tokenTicker: Web3.utils.fromAscii(value)}))}
            />
          </div>
        </div>
          <div className="form-group row">
            <label className="col-sm-4 col-form-label" htmlFor="token-address">Address</label>
            <div className="col-sm-8">
              <input 
                type="text" 
                className="form-control" 
                id="token-address" 
                onChange={({ target: { value }}) => setNewToken(newToken => ({ ...newToken, tokenAddress: value}))}
              />
            </div>
          </div>
        
        <div className="text-right">
          <button type="submit" className="btn btn-primary">Submit</button>
        </div>
      </form>
    </div>
  );
}

export default AddToken;


