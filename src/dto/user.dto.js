export class UserDTO {
    constructor(user) {
        this.id = user._id;
        this.firstName = user.firstName;
        this.lastName = user.lastName;
        this.email = user.email;
        this.role = user.role;
        this.cart = user.cart;
        this.createdAt = user.createdAt;
        this.lastConnection = user.lastConnection;
    }

    static toDTO(user) {
        return new UserDTO(user);
    }

    static toDTOList(users) {
        return users.map(user => new UserDTO(user));
    }
} 