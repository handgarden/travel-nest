import { UpdatePasswordDto } from './dto/update-password.dto';
import { Test, TestingModule } from '@nestjs/testing';
import { MemberController } from './member.controller';
import { MemberService } from './member.service';
import { Role } from './enum/Role';
import { MemberProfile } from './dto/member-profile.dto';
import { JwtMemberDto } from 'src/auth/dto/jwt-member.dto';
import { UpdateNicknameDto } from './dto/update-nickname.dto';

describe('MemberController', () => {
  let controller: MemberController;
  const service: Partial<MemberService> = {
    getProfile: jest.fn(),
    updateNickname: jest.fn(),
    updatePassword: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MemberController],
      providers: [
        {
          provide: MemberService,
          useValue: service,
        },
      ],
    }).compile();

    controller = module.get<MemberController>(MemberController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getProfile', () => {
    it('정상 프로필 반환', async () => {
      const memberProfile = new MemberProfile();
      memberProfile.nickname = 'nickname';
      memberProfile.createdAt = new Date();
      memberProfile.updatedAt = new Date();
      jest.spyOn(service, 'getProfile').mockResolvedValue(memberProfile);
      const jwtMemberDto = new JwtMemberDto(1, 'nickname', Role.USER);
      const profile = await controller.getProfile(jwtMemberDto);
      expect(profile).toEqual(memberProfile);
    });
  });

  describe('updateNickname', () => {
    it('이전 닉네임과 동일한 닉네임으로 요청 시 바로 성공', async () => {
      const spy = jest.spyOn(service, 'updateNickname');
      const jwtMemberDto = new JwtMemberDto(1, 'nickname', Role.USER);
      const updateNicknameDto = new UpdateNicknameDto('nickname');
      const success = await controller.updateNickname(
        jwtMemberDto,
        updateNicknameDto,
      );
      expect(success).toEqual('success');
      expect(spy).not.toBeCalled();
    });

    it('업데이트 성공시 success 반환', async () => {
      const spy = jest.spyOn(service, 'updateNickname');

      const jwtMemberDto = new JwtMemberDto(1, 'nickname', Role.USER);
      const updateNicknameDto = new UpdateNicknameDto('newNickname');
      const success = await controller.updateNickname(
        jwtMemberDto,
        updateNicknameDto,
      );
      expect(success).toEqual('success');
      expect(spy).toBeCalled();
    });
  });

  describe('updatePassword', () => {
    it('비밀번호 업데이트 성공시 success 반환', async () => {
      const spy = jest.spyOn(service, 'updatePassword');

      const jwtMemberDto = new JwtMemberDto(1, 'nickname', Role.USER);
      const updatePasswordDto = new UpdatePasswordDto();
      updatePasswordDto.prevPassword = 'password';
      updatePasswordDto.newPassword = 'newPassword';
      const success = await controller.updatePassword(
        jwtMemberDto,
        updatePasswordDto,
      );
      expect(success).toEqual('success');
      expect(spy).toBeCalled();
    });
  });
});
