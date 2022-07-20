import { StockService }  from '@/services/StockService'
import { ActionTree } from 'vuex'
import RootState from '@/store/RootState'
import StockState from './StockState'
import * as types from './mutation-types'
import { hasError } from '@/utils'

const actions: ActionTree<StockState, RootState> = {
  async checkInventory({commit}, params) {
    let resp;
    const payload = {
      "viewSize": params.productId?.length,
      "filters":{
        "facilityId": params.facilityId,
        "sku": params.sku
      } 
    }

    try {
      resp = await StockService.checkInventory(payload);
      if(resp.status == 200 && !hasError(resp) && resp.data.docs?.length > 0){
        commit(types.STOCK_PRODUCTS_UPDATED, resp.data.docs)
      }
    } catch (err) {
      console.error(err);
    }
  },
  async checkPreorderItemAvailability ({ commit, state }, productIds) {
    let resp;
    const cachedProductIds = Object.keys(state.preorderItemAvailability);
    const productIdFilter= productIds.reduce((filter: any, productId: any) => {
      // If product already exist in cached products skip
      if (!cachedProductIds.includes(productId)) {
        filter.push(productId);
      }
      return filter;
    }, []);
    if(productIdFilter){
      const payload = {
        "viewIndex": 0,
        "viewSize": productIdFilter.length,
        "filters": {
          "sku": productIdFilter,
          "sku_op": "in"
        }
      }
      try {
        resp = await StockService.checkPreorderItemAvailability(payload);
        if (resp.status == 200 && !hasError(resp) && resp.data?.docs) {
          commit(types.STOCK_ITEM_AVAILABILITY_UPDATED, resp.data.docs)
        } else {
          commit(types.STOCK_ITEM_AVAILABILITY_UPDATED, []);
        }
      } catch (err) {
        console.error(err);
        commit(types.STOCK_ITEM_AVAILABILITY_UPDATED, []);
      }
    }
  }
}
export default actions;