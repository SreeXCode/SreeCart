const getSearchQuery = (keyword, category, price) => {
    let query = {};

    // Keyword search (name, category, description)
    if (keyword) {
        query.$or = [
            { name: { $regex: keyword, $options: "i" } },
            { category: { $regex: keyword, $options: "i" } },
            { description: { $regex: keyword, $options: "i" } }
        ];
    }

    // Category filter
    if (category) {
        query.category = { $regex: category, $options: "i" };
    }

    // Price filter (supporting price[lt], price[gt], price[lte], price[gte])
    if (price && Object.keys(price).length > 0) {
        query.price = {};
        if (price.lt) query.price.$lt = Number(price.lt);
        if (price.gt) query.price.$gt = Number(price.gt);
        if (price.lte) query.price.$lte = Number(price.lte);
        if (price.gte) query.price.$gte = Number(price.gte);
    }

    return query;
};

// ✅ Pagination function (Fixed 2 products per page)
const getPagination = (page, limit = 2) => {
    const pageNumber = Number(page) || 1; // Default to page 1
    const pageSize = limit; // ✅ Fixed limit to 2
    const skip = (pageNumber - 1) * pageSize; // Calculate how many documents to skip
    return { skip, limit: pageSize };
};

// ✅ Export functions properly
module.exports = { getSearchQuery, getPagination };
