import { searchSellerData } from '../db/queries/sellerSearch.js'
import { respond } from '../utils/respond.js'

export async function handleSearch(req, res, next) {
  try {
    const q = (req.query.q ?? '').trim()
    if (q.length < 2) return respond(res, 200, { clients: [], prospects: [] })

    const results = await searchSellerData(req.seller.sellerId, q)
    respond(res, 200, results)
  } catch (err) { next(err) }
}
