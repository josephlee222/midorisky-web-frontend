// User authentication
import { jwtDecode } from "jwt-decode";
import { getCurrentUser, fetchAuthSession } from "aws-amplify/auth";

export async function validateAdmin() {
    try {
        var user = await getCurrentUser();
        var groups = (await fetchAuthSession()).tokens.accessToken.payload["cognito:groups"];

        if (user && groups.includes("admin")) {
            return true;
        } else {
            return false;
        }
    } catch {
        return false;
    }
}


export async function validateStaffRoles(staffRoles) {
    try {
        var user = await getCurrentUser();
        var groups = (await fetchAuthSession()).tokens.accessToken.payload["cognito:groups"];
        const isStaff = groups.some(item => staffRoles.includes(item));
        if (user && isStaff) {
            return true;
        } else {
            return false;
        }
    } catch {
        return false;
    }
}

export async function validateUser() {
    try {
        var user = await getCurrentUser();

        if (user) {
            return true;
        } else {
            return false;
        }
    } catch {
        return false;
    }
}