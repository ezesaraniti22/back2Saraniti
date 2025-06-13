export class ProductDTO {
    constructor(product) {
        this.id = product._id;
        this.title = product.title;
        this.description = product.description;
        this.price = product.price;
        this.category = product.category;
        this.stock = product.stock;
        this.thumbnail = product.thumbnail || (product.thumbnails && product.thumbnails[0]) || '';
        this.status = product.status;
        this.code = product.code;
    }

    static toDTO(product) {
        return new ProductDTO(product);
    }

    static toDTOList(products) {
        return products.map(product => new ProductDTO(product));
    }
} 