// ✅ Build Search Query
const getSearchQuery = (keyword, category, price) => {
    let query = {};
    
    // Keyword search (name, category, description)
    if (keyword && keyword.trim()) {
        const trimmedKeyword = keyword.trim();
        query.$or = [
            { name: { $regex: trimmedKeyword, $options: "i" } },
            { category: { $regex: trimmedKeyword, $options: "i" } },
            { description: { $regex: trimmedKeyword, $options: "i" } }
        ];
    }

    // Category filter
     // ✅ Exact category match (required due to enum)
     if (category && category.trim()) {
        query.category = category.trim();
    }

    // Price filter (handling lt, gt, lte, gte)
    if (price && Object.keys(price).length > 0) {
        let priceFilter = {};
        if (price.lt) priceFilter.$lt = Number(price.lt);
        if (price.gt) priceFilter.$gt = Number(price.gt);
        if (price.lte) priceFilter.$lte = Number(price.lte);
        if (price.gte) priceFilter.$gte = Number(price.gte);

        if (Object.keys(priceFilter).length > 0) {
            query.price = priceFilter;
        }
    }

    return query;
};

// ✅ Pagination function (Fixed products per page)
const getPagination = (pageNo, PagePerLimit ) => {
    const pageNumber = Number(pageNo) // Default to page 1
    const PagePerProduct = PagePerLimit ;
    const skipProducts = (pageNumber - 1) * PagePerProduct; // Calculate how many documents to skip
    return { skipProducts, PagePerProduct };
};

// ✅ Export functions properly
module.exports = { getSearchQuery, getPagination };
