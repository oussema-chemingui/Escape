const { db } = require('./index.js');

///////////////////////////////////////////////////////////
// query to fetch element for the store.js component
//////////////////////////////////////////////////////////
const getAllEquipments = () => {
    return db.queryAsync('select * from equipments')
}

const getEquipmentsToRent = () => {
    return db.queryAsync('select * from equipments where toRent=1')
}

const getEquipmentsToBuy = () => {
    return db.queryAsync('select * from equipments where toSell=1')
}

const getEquipmentByPriceInc = (type) => {
    if (type === 'toRent') {
        return db.queryAsync('select * from equipments  where toRent = 1 order by price')
    } else if (type === 'toSell') {
        return db.queryAsync('select * from equipments  where toSell = 1 order by price')
    }
}

const updateInCartValue = (id) => {
    return db.queryAsync(`UPDATE equipments SET inCart= !inCart WHERE id= '${id}'`)
}

const getElementInCart = () => {
    return db.queryAsync('select * from equipments where inCart = 1')
}

/////////////////////////////////////////////////////////////


module.exports = {
    getAllEquipments,
    getEquipmentsToRent,
    getEquipmentsToBuy,
    getEquipmentByPriceInc,
    updateInCartValue,
    getElementInCart
}

