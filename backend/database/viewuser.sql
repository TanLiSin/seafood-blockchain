SELECT * FROM users;


SELECT 
    u.id AS user_id,
    u.username,
    u.wallet_address,
    r.role_name
FROM 
    user_roles ur
JOIN 
    users u ON ur.user_id = u.id
JOIN 
    roles r ON ur.role_id = r.id;
