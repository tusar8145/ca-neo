import { useAppSelector } from 'app/store/hooks';
import { selectUserRole, selectUser } from '../../auth/user/store/userSlice';


function User() {
    const user = useAppSelector(selectUser);
    return user;
}

export default User;