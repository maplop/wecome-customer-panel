export interface JsonRolStatement {
  Action: string[];
  Effect: string;
  Resource: string;
}

export interface JsonRol {
  Version: number;
  Statement: JsonRolStatement[];
}

export interface UserInfoType {
  user: number;
  group: number;
  company: number;
  objects: Record<string, unknown>;
  json_rol: JsonRol;
}
