-- DESCRIBE gapp_fines;
# Field	Type	Null	Key	Default	Extra
fine_id	int	NO	PRI		auto_increment
infraction	varchar(100)	NO			
ait	varchar(100)	NO			
gravity	varchar(100)	NO			
points	int	NO			
article_ctb	varchar(100)	NO			
offending_driver_date	date	NO			
offending_driver	tinyint(1)	NO			
expen_id_fk	int	NO	MUL		
infraction_id_fk	int	YES	MUL		

-- DESCRIBE gapp_maintenance;
# Field	Type	Null	Key	Default	Extra
maint_id	int	NO	PRI		auto_increment
technician	varchar(100)	YES			
service_value	decimal(10,2)	YES			
list_parts	json	YES			
value_parts	decimal(10,2)	YES		0.00	
km_day	int	NO			
km_next	int	YES			
date_next	date	YES			
warranty	tinyint(1)	NO		0	
validity	date	YES			
expen_id_fk	int	NO	MUL		


-- DESCRIBE gapp_fuel;
# Field	Type	Null	Key	Default	Extra
fuel_id	int	NO	PRI		auto_increment
liter_value	decimal(10,2)	NO			
coupon_number	bigint	YES			
km_day	int	NO			
liter_qtd	decimal(10,3)	NO			
expen_id_fk	int	NO	MUL		
fuel_type_id_fk	int	NO	MUL	1	
item_number	int	NO		1	
detail	varchar(150)	NO		Abastecimento	



-- DESCRIBE gapp_sinister;
# Field	Type	Null	Key	Default	Extra
sinister_id	int	NO	PRI		auto_increment
guilty	varchar(255)	NO			
victim	tinyint(1)	NO		0	
finished	date	YES			
others_documents	varchar(255)	YES			
data_third	varchar(255)	YES			
bo_number	varchar(45)	YES			
bo_receipt_date	date	YES			
bo_shipping_date	date	YES			
observation	varchar(255)	NO			
damage_type_id_fk	int	NO	MUL		
expen_id_fk	int	NO	MUL		
id_insurance_fk	int	NO	MUL		
