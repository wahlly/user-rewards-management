import { MigrationInterface, QueryRunner } from "typeorm";

export class AchivementNaming1787501215334 implements MigrationInterface {
    name = 'AchivementNaming1787501215334'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user_achievements\` CHANGE \`achievementName\` \`achievement_name\` varchar(255) NOT NULL`);
        await queryRunner.query(`CREATE TABLE \`cashbacks\` (\`id\` int NOT NULL AUTO_INCREMENT, \`badge_name\` varchar(255) NOT NULL, \`amount\` decimal(10,2) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`user\` int NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`transfers\` (\`id\` int NOT NULL AUTO_INCREMENT, \`recipient_code\` varchar(255) NOT NULL, \`transfer_code\` varchar(255) NULL, \`reference\` varchar(255) NULL, \`status\` varchar(255) NOT NULL DEFAULT 'pending', \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`cashback\` int NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`user_achievements\` DROP COLUMN \`achievement_name\``);
        await queryRunner.query(`ALTER TABLE \`user_achievements\` ADD \`achievement_name\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`cashbacks\` ADD CONSTRAINT \`FK_3a4273fb4f3afe846f1aa64ed68\` FOREIGN KEY (\`user\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`transfers\` ADD CONSTRAINT \`FK_627ebf56cdd6f466c4d69de377c\` FOREIGN KEY (\`cashback\`) REFERENCES \`cashbacks\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`transfers\` DROP FOREIGN KEY \`FK_627ebf56cdd6f466c4d69de377c\``);
        await queryRunner.query(`ALTER TABLE \`cashbacks\` DROP FOREIGN KEY \`FK_3a4273fb4f3afe846f1aa64ed68\``);
        await queryRunner.query(`ALTER TABLE \`user_achievements\` DROP COLUMN \`achievement_name\``);
        await queryRunner.query(`ALTER TABLE \`user_achievements\` ADD \`achievement_name\` varchar(255) NOT NULL`);
        await queryRunner.query(`DROP TABLE \`transfers\``);
        await queryRunner.query(`DROP TABLE \`cashbacks\``);
        await queryRunner.query(`ALTER TABLE \`user_achievements\` CHANGE \`achievement_name\` \`achievementName\` varchar(255) NOT NULL`);
    }

}
