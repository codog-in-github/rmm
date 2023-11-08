interface Model {
  id: number
}

interface User extends Model {
  username: string,
  role_id: number,
  realname: string
}

interface Auth extends Model {
  key: string,
  name: string
}

interface Storehouse extends Model {

}

interface Stock extends Model {
  
}