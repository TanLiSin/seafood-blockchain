-- 1. Insert 'Admin' role if not exists
INSERT INTO roles (role_name)
VALUES ('Admin')
ON CONFLICT (role_name) DO NOTHING;

-- 2. Insert user with username and wallet address
INSERT INTO users (id, username, wallet_address)
VALUES ('A001', 'admin_user', 'LSI7W3QH75WUNE3FEOMCEBHNZUWMEVPM4DKGZYX4E6SFYNTM5ZIZE7FJWU')
ON CONFLICT (wallet_address) DO NOTHING;

-- 3. Link user to 'Admin' role
-- Get the role ID of 'admin'
WITH role_cte AS (
  SELECT id FROM roles WHERE role_name = 'admin'
)
INSERT INTO user_roles (user_id, role_id)
SELECT 'A001', id FROM role_cte;
